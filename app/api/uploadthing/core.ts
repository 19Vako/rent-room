import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth/auth";

const f = createUploadthing();

export const ourFileRouter = {

  roomImage: f({ image: { maxFileSize: "16MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      
      const session = await auth();

      if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized: Только администратор может загружать фото комнат");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;