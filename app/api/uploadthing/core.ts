import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  // Определяем маршрут для загрузки фото комнаты
  roomImage: f({ image: { maxFileSize: "16MB", maxFileCount: 5 } })
    .middleware(async ({ req }) => {
      // Здесь позже можно добавить проверку сессии на АДМИНА
      // const session = await auth();
      // if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
      return { }; 
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Этот код сработает на сервере, когда картинка загрузится
      console.log("File URL: ", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;