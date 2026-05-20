/**
 * @jest-environment node
 */
import {
  getAllRooms,
  getRoomById,
  blockRoomDates,
  unblockRoomDates,
  createRoom,
  deleteRoom,
  updateRoom,
  getRoomCalendarEvents,
  addRoomImage,
  removeRoomImage,
} from "@/src/lib/actions/room.actions";
import { auth } from "@/src/auth/auth";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import Room from "@/src/types/Room";

const mockFindOne = jest.fn();
const mockInsertOne = jest.fn();
const mockUpdateOne = jest.fn();
const mockDeleteMany = jest.fn();
const mockInsertMany = jest.fn();
const mockDeleteOne = jest.fn();

const mockToArray = jest.fn();
const mockSort = jest.fn().mockReturnValue({ toArray: mockToArray });
const mockProject = jest.fn().mockReturnValue({ toArray: mockToArray });
const mockFind = jest.fn().mockReturnValue({
  project: mockProject,
  sort: mockSort,
  toArray: mockToArray,
});

jest.mock("uploadthing/server", () => {
  return {
    UTApi: jest.fn().mockImplementation(() => ({
      deleteFiles: jest.fn().mockResolvedValue({ success: true }),
    })),
  };
});

jest.mock("@/src/lib/mongodb", () => {
  return Promise.resolve({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: (...args: []) => mockFindOne(...args),
        insertOne: (...args: []) => mockInsertOne(...args),
        updateOne: (...args: []) => mockUpdateOne(...args),
        find: (...args: []) => mockFind(...args),
        deleteMany: (...args: []) => mockDeleteMany(...args),
        insertMany: (...args: []) => mockInsertMany(...args),
        deleteOne: (...args: []) => mockDeleteOne(...args),
      }),
    }),
  });
});

jest.mock("@/src/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("Room Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllRooms", () => {
    it("should successfully return all rooms with formatted IDs", async () => {
      const mockDbRooms = [
        {
          _id: new ObjectId("507f1f77bcf86cd799439011"),
          roomName: "Standard Room",
          price: 100,
        },
        {
          _id: new ObjectId("507f1f77bcf86cd799439012"),
          roomName: "Deluxe Suite",
          price: 250,
        },
      ];

      mockToArray.mockResolvedValueOnce(mockDbRooms);

      const result = await getAllRooms();

      expect(result.success).toBe(true);
      expect(result.rooms).toHaveLength(2);

      expect(result.rooms?.[0]).toEqual({
        id: "507f1f77bcf86cd799439011",
        roomName: "Standard Room",
        price: 100,
      });

      expect(mockFind).toHaveBeenCalled();
    });

    it("should return an error message when database fetch fails", async () => {
      mockToArray.mockRejectedValueOnce(new Error("DB Connection Failed"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getAllRooms();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Something went wrong");
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("getRoomById", () => {
    const mockRoomId = "507f1f77bcf86cd799439011";

    it("should successfully return a room when a valid ID is provided", async () => {
      const mockDbRoom = {
        _id: new ObjectId(mockRoomId),
        roomName: "Lux Apartment",
        price: 300,
        capacity: 2,
      };

      mockFindOne.mockResolvedValueOnce(mockDbRoom);

      const result = await getRoomById(mockRoomId);

      expect(result.success).toBe(true);
      expect(result.room).toEqual({
        id: mockRoomId,
        roomName: "Lux Apartment",
        price: 300,
        capacity: 2,
        status: "AVAILABLE",
      });
      expect(mockFindOne).toHaveBeenCalledWith({
        _id: new ObjectId(mockRoomId),
      });
    });

    it("should return error if room is not found", async () => {
      mockFindOne.mockResolvedValueOnce(null);

      const result = await getRoomById(mockRoomId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Room not found");
      expect(result.room).toBeUndefined();
    });

    it("should return error if database throws an exception", async () => {
      mockFindOne.mockRejectedValueOnce(new Error("Connection error"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await getRoomById(mockRoomId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Something went wrong");

      consoleSpy.mockRestore();
    });
  });

  describe("createRoom", () => {
    const mockRoomData: Omit<Room, "status" | "id"> = {
      roomName: "Lux Apartment",
      price: 300,
      capacity: 2,
      description: "X",
      type: "DELUXE",
      photoUrl: [],
    };

    it("should successfully create a new room", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });

      mockFindOne.mockResolvedValueOnce(null);

      const mockRoomResult = {
        insertedId: new ObjectId("507f1f77bcf86cd799439011"),
      };
      mockInsertOne.mockResolvedValueOnce(mockRoomResult);

      const result = await createRoom(mockRoomData);

      expect(result.success).toBe(true);
      expect(result.roomId).toBe("507f1f77bcf86cd799439011");

      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          roomName: "Lux Apartment",
          price: 300,
        }),
      );
    });

    it("should return an error message when database insertion fails", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });

      mockFindOne.mockResolvedValueOnce(null);
      mockInsertOne.mockRejectedValueOnce(new Error("DB Connection Failed"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const result = await createRoom(mockRoomData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to create room. Check data format.");

      consoleSpy.mockRestore();
    });
  });

  describe("blockRoomDates", () => {
    const roomId = "507f1f77bcf86cd799439011";
    const startDate = "2026-05-01";
    const endDate = "2026-05-05";
    const reason = "Maintenance";

    it("should successfully block room dates", async () => {
      mockFindOne.mockResolvedValueOnce(null);
      mockFindOne.mockResolvedValueOnce(null);

      mockInsertOne.mockResolvedValueOnce({ acknowledged: true });

      const result = await blockRoomDates(roomId, startDate, endDate, reason);

      expect(result.success).toBe(true);
      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          roomId: new ObjectId(roomId),
          reason: reason,
        }),
      );
    });

    it("should return error if end date is before start date", async () => {
      const result = await blockRoomDates(
        roomId,
        "2026-05-10",
        "2026-05-01",
        reason,
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("End date cannot be before start date.");
      expect(mockInsertOne).not.toHaveBeenCalled();
    });

    it("should return error if dates are already blocked", async () => {
      mockFindOne.mockResolvedValueOnce({ _id: new ObjectId() });

      const result = await blockRoomDates(roomId, startDate, endDate, reason);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Some of these dates are already blocked.");
      expect(mockInsertOne).not.toHaveBeenCalled();
    });

    it("should return error if there is an active booking", async () => {
      mockFindOne.mockResolvedValueOnce(null);
      mockFindOne.mockResolvedValueOnce({
        _id: new ObjectId(),
        status: "CONFIRMED",
      });

      const result = await blockRoomDates(roomId, startDate, endDate, reason);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Cannot block dates: there is an active booking.",
      );
    });

    it("should return error message when database fails", async () => {
      mockFindOne.mockRejectedValueOnce(new Error("DB failure"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await blockRoomDates(roomId, startDate, endDate, reason);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Something went wrong while blocking dates.");

      consoleSpy.mockRestore();
    });
  });

  describe("unblockRoomDates", () => {
    const roomId = "507f1f77bcf86cd799439011";
    const startDate = "2026-05-02";
    const endDate = "2026-05-03";

    it("should throw an error if the user is not an admin", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "USER" } });

      await expect(
        unblockRoomDates(roomId, startDate, endDate),
      ).rejects.toThrow("Only admins can unblock dates");
    });

    it("should successfully do nothing if no overlapping blocks found", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });
      mockToArray.mockResolvedValueOnce([]);

      const result = await unblockRoomDates(roomId, startDate, endDate);

      expect(result.success).toBe(true);
      expect(mockDeleteMany).not.toHaveBeenCalled();
    });

    it("should split a blocked period into two when unblocking the middle", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });

      const existingBlock = {
        _id: new ObjectId("507f1f77bcf86cd799439012"),
        roomId: new ObjectId(roomId),
        startDate: new Date("2026-05-01T00:00:00.000Z"),
        endDate: new Date("2026-05-05T23:59:59.999Z"),
        reason: "Maintenance",
      };

      mockToArray.mockResolvedValueOnce([existingBlock]);
      mockDeleteMany.mockResolvedValueOnce({ acknowledged: true });
      mockInsertMany.mockResolvedValueOnce({ acknowledged: true });

      const result = await unblockRoomDates(roomId, "2026-05-02", "2026-05-03");

      expect(result.success).toBe(true);

      expect(mockDeleteMany).toHaveBeenCalledWith({
        _id: { $in: [existingBlock._id] },
      });

      expect(mockInsertMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ endDate: expect.any(Date) }),
          expect.objectContaining({ startDate: expect.any(Date) }),
        ]),
      );
    });

    it("should return error message when database fetch fails", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });
      mockToArray.mockRejectedValueOnce(new Error("Fetch failed"));

      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await unblockRoomDates(roomId, startDate, endDate);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Something went wrong while unblocking dates.");

      consoleSpy.mockRestore();
    });
  });

  describe("deleteRoom", () => {
    const roomId = "507f1f77bcf86cd799439011";
    it("should throw an error if the user is not an admin", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "USER" } });

      await expect(deleteRoom(roomId)).rejects.toThrow(
        "Only admins can delete rooms",
      );
    });

    it("should successfully delete a room", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });
      mockDeleteOne.mockResolvedValueOnce({ deletedCount: 1 });

      const result = await deleteRoom(roomId);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);
      expect(mockDeleteOne).toHaveBeenCalledWith({
        _id: new ObjectId(roomId),
      });
      expect(revalidatePath).toHaveBeenCalledWith("/admin");
    });

    it("should return error when database fails", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });
      mockDeleteOne.mockRejectedValueOnce(new Error("DB Error"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await deleteRoom(roomId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Something went wrong");

      consoleSpy.mockRestore();
    });
  });

  describe("updateRoom", () => {
    const roomId = "507f1f77bcf86cd799439011";
    const updateData = {
      roomName: "Updated Name",
      type: "SUITE" as const,
      capacity: 4,
      price: 500,
      description: "Updated description",
    };

    it("should throw an error if the user is not an admin", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "USER" } });

      await expect(updateRoom(roomId, updateData)).rejects.toThrow(
        "Only admins can update rooms",
      );
    });

    it("should successfully update room data", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const result = await updateRoom(roomId, updateData);

      expect(result.success).toBe(true);
      expect(result.updatedCount).toBe(1);

      // Проверяем, что данные ушли с приведением типов (Number)
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(roomId) },
        expect.objectContaining({
          $set: expect.objectContaining({
            roomName: "Updated Name",
            type: "SUITE",
            capacity: 4,
            price: 500,
          }),
        }),
      );
      expect(revalidatePath).toHaveBeenCalledWith("/admin");
    });

    it("should return error when update fails", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });
      mockUpdateOne.mockRejectedValueOnce(new Error("Update failed"));
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const result = await updateRoom(roomId, updateData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Something went wrong");

      consoleSpy.mockRestore();
    });
  });

  describe("getRoomCalendarEvents", () => {
    const roomId = "507f1f77bcf86cd799439011";
    it("should return orders and blocked dates", async () => {
      const mockOrders = [{ _id: new ObjectId(), status: "CONFIRMED" }];
      const mockBlocks = [{ _id: new ObjectId(), reason: "Maintenance" }];

      mockToArray
        .mockResolvedValueOnce(mockOrders)
        .mockResolvedValueOnce(mockBlocks);

      const result = await getRoomCalendarEvents(roomId);

      expect(result.success).toBe(true);
      expect(result.orders).toHaveLength(1);
      expect(result.blockedDates).toHaveLength(1);
    });
  });

  describe("addRoomImage", () => {
    const roomId = "507f1f77bcf86cd799439011";
    const mockImageUrl = "https://utfs.io/f/some-file-key.png";
    it("should add image URL via $push", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const result = await addRoomImage(roomId, mockImageUrl);

      expect(result.success).toBe(true);
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(roomId) },
        { $push: { photoUrl: mockImageUrl } },
      );
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });
  });

  describe("removeRoomImage", () => {
    const roomId = "507f1f77bcf86cd799439011";
    const mockImageUrl = "https://utfs.io/f/some-file-key.png";
    it("should delete file from storage and pull URL from DB", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "ADMIN" } });
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const result = await removeRoomImage(roomId, mockImageUrl);

      expect(result.success).toBe(true);
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(roomId) },
        { $pull: { photoUrl: mockImageUrl } },
      );
      expect(revalidatePath).toHaveBeenCalledWith("/admin");
    });

    it("should throw error if user is not admin", async () => {
      (auth as jest.Mock).mockResolvedValue({ user: { role: "USER" } });

      await expect(removeRoomImage(roomId, mockImageUrl)).rejects.toThrow(
        "Only admins can remove images from rooms",
      );
    });
  });
});
