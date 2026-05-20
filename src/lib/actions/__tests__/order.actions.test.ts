/**
 * @jest-environment node
 */
import {
  createOrder,
  cancelOrder,
  getUserOrders,
  getAvailableRooms,
} from "@/src/lib/actions/order.actions";
import { auth } from "@/src/auth/auth";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";

jest.mock("@/src/auth/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

const mockFindOne = jest.fn();
const mockInsertOne = jest.fn();
const mockUpdateOne = jest.fn();

const mockToArray = jest.fn();
const mockSort = jest.fn().mockReturnValue({ toArray: mockToArray });
const mockProject = jest.fn().mockReturnValue({ toArray: mockToArray });
const mockFind = jest.fn().mockReturnValue({
  project: mockProject,
  sort: mockSort,
  toArray: mockToArray,
});

jest.mock("@/src/lib/mongodb", () => {
  return Promise.resolve({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        findOne: (...args: []) => mockFindOne(...args),
        insertOne: (...args: []) => mockInsertOne(...args),
        updateOne: (...args: []) => mockUpdateOne(...args),
        find: (...args: []) => mockFind(...args),
      }),
    }),
  });
});

describe("Server Actions: Orders", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("it must return an error if the user is not logged in", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await createOrder(
        "room_id",
        "2026-05-01",
        "2026-05-05",
        100,
        2,
      );

      expect(result).toEqual({
        success: false,
        error: "Please log in to the system",
      });
    });

    it("it must successfully create an order and update the cache", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockRoomId = "507f1f77bcf86cd799439012";

      (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });

      mockInsertOne.mockResolvedValueOnce({ insertedId: new ObjectId() });
      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const result = await createOrder(
        mockRoomId,
        "2026-05-01",
        "2026-05-05",
        100,
        2,
      );

      expect(result.success).toBe(true);
      expect(mockInsertOne).toHaveBeenCalledTimes(1);
      expect(mockUpdateOne).toHaveBeenCalledTimes(1);
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });
  });

  describe("cancelOrder", () => {
    it("it must successfully cancel an order if it belongs to the user", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockOrderId = "507f1f77bcf86cd799439013";

      (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });

      mockFindOne.mockResolvedValueOnce({
        _id: new ObjectId(mockOrderId),
        userId: new ObjectId(mockUserId),
      });

      mockUpdateOne.mockResolvedValueOnce({ modifiedCount: 1 });

      const result = await cancelOrder(mockOrderId);

      expect(result.success).toBe(true);
      expect(mockUpdateOne).toHaveBeenCalledWith(
        { _id: new ObjectId(mockOrderId) },
        { $set: { status: "CANCELLED" } },
      );
      expect(revalidatePath).toHaveBeenCalledWith("/");
    });

    it("it must return an error when trying to cancel someone else's order", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const mockOrderId = "507f1f77bcf86cd799439013";
      const foreignUserId = "507f1f77bcf86cd799439099";

      (auth as jest.Mock).mockResolvedValue({ user: { id: mockUserId } });

      mockFindOne.mockResolvedValueOnce({
        _id: new ObjectId(mockOrderId),
        userId: new ObjectId(foreignUserId),
      });

      const result = await cancelOrder(mockOrderId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("You can only cancel your own orders");
      expect(mockUpdateOne).not.toHaveBeenCalled();
    });
  });

  describe("getAvailableRooms", () => {
    it("it must return an error if the check-in date is in the past", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);

      const result = await getAvailableRooms(pastDate, futureDate, 2);

      expect(result.success).toBe(false);
      expect(result.error).toBe("The check-in date cannot be in the past.");
    });

    it("it must return an error if the check-out date is earlier than the check-in date", async () => {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 5);
      const checkOutDate = new Date();
      checkOutDate.setDate(checkOutDate.getDate() + 2);

      const result = await getAvailableRooms(checkInDate, checkOutDate, 2);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "The check-out date must be later than the check-in date.",
      );
    });

    it("it must successfully return a list of available rooms", async () => {
      const checkInDate = new Date();
      checkInDate.setDate(checkInDate.getDate() + 1);
      const checkOutDate = new Date();
      checkOutDate.setDate(checkOutDate.getDate() + 5);

      mockToArray.mockResolvedValue([
        {
          _id: new ObjectId("507f1f77bcf86cd799439011"),
          roomName: "Люкс",
          type: "DELUXE",
          price: 1500,
          capacity: 3,
          photoUrl: "/lux.jpg",
        },
      ]);

      const result = await getAvailableRooms(checkInDate, checkOutDate, 2);

      expect(result.success).toBe(true);
      expect(result.rooms).toHaveLength(1);
      expect(result.rooms?.[0].roomName).toBe("Люкс");
      expect(mockFind).toHaveBeenCalledTimes(3);
    });
  });

  describe("getUserOrders", () => {
    it("it must return an error if the user is not authenticated", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const result = await getUserOrders();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Please log in to the system");
    });

    it("it must return orders for regular users", async () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      (auth as jest.Mock).mockResolvedValue({
        user: { id: mockUserId, role: "USER" },
      });

      const mockDbOrder = {
        _id: new ObjectId("507f1f77bcf86cd799439022"),
        roomId: new ObjectId("507f1f77bcf86cd799439033"),
        status: "CONFIRMED",
      };
      mockToArray.mockResolvedValueOnce([mockDbOrder]);

      const result = await getUserOrders();

      expect(result.success).toBe(true);
      expect(result.orders).toBeDefined();
      expect(result.orders?.[0].id).toBe("507f1f77bcf86cd799439022");
      expect(mockFind).toHaveBeenCalledWith({
        userId: new ObjectId(mockUserId),
      });
    });

    it("it must return all future orders for ADMIN", async () => {
      const mockAdminId = "507f1f77bcf86cd799439099";
      (auth as jest.Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "ADMIN" },
      });

      mockToArray.mockResolvedValueOnce([]);

      const result = await getUserOrders();

      expect(result.success).toBe(true);
      expect(result.orders).toEqual([]);
      expect(mockFind).toHaveBeenCalledWith(
        expect.objectContaining({
          checkOutDate: expect.any(Object),
        }),
      );
    });
  });
});
