import SearchWidget from "./components/shared/SearchWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* Hero секция с фоном */}
      <section 
        className="relative pt-24 pb-32 px-4 flex flex-col items-center justify-center bg-[#003580]" 
        // Если у тебя есть картинка для фона, раскомментируй строку ниже и добавь картинку в папку public
        // style={{ backgroundImage: "url('/hero-background.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Если используешь картинку, этот div затемнит её, чтобы текст хорошо читался */}
        {/* <div className="absolute inset-0 bg-[#003580]/80"></div> */}
        
        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-2">
              Найдите идеальное место для отдыха
            </h1>
            <p className="text-white text-xl md:text-2xl">
              Забронируйте апартаменты или номер всего в пару кликов.
            </p>
          </div>

          {/* Наш клиентский виджет */}
          <div className="mt-4">
            <SearchWidget />
          </div>
        </div>
      </section>

   {/* 
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Доступные варианты</h2>
        <div className="text-gray-500">
          Здесь скоро появятся карточки комнат из базы данных...
        </div>
      </section> */}

    </main>
  );
}