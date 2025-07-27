'use client'

export default function PersianFontTestPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 font-persian">تست فونت فارسی وزیر</h1>
      
      <div className="space-y-6">
        {/* Default font */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">فونت پیش‌فرض</h2>
          <p>این متن با فونت پیش‌فرض نمایش داده می‌شود.</p>
        </div>

        {/* Persian font class */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 font-persian">فونت فارسی وزیر (کلاس)</h2>
          <p className="font-persian">این متن با فونت فارسی وزیر (Vazirmatn) نمایش داده می‌شود.</p>
        </div>

        {/* Lang attribute */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2" lang="fa">فونت فارسی (lang="fa")</h2>
          <p lang="fa">این متن با استفاده از lang="fa" فونت فارسی دریافت می‌کند.</p>
        </div>

        {/* RTL direction */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2" dir="rtl">فونت فارسی (dir="rtl")</h2>
          <p dir="rtl">این متن با استفاده از dir="rtl" فونت فارسی دریافت می‌کند.</p>
        </div>

        {/* Mixed content */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">محتوی ترکیبی</h2>
          <p className="font-persian">
            این متن فارسی است و <span className="font-sans">این متن انگلیسی است</span> و دوباره فارسی.
          </p>
        </div>

        {/* Different weights */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 font-persian">وزن‌های مختلف فونت وزیر</h2>
          <div className="space-y-2 font-persian">
            <p className="font-thin">وزن 100 - Thin</p>
            <p className="font-light">وزن 300 - Light</p>
            <p className="font-normal">وزن 400 - Normal</p>
            <p className="font-medium">وزن 500 - Medium</p>
            <p className="font-semibold">وزن 600 - Semi Bold</p>
            <p className="font-bold">وزن 700 - Bold</p>
            <p className="font-extrabold">وزن 800 - Extra Bold</p>
            <p className="font-black">وزن 900 - Black</p>
          </div>
        </div>

        {/* Sample text */}
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 font-persian">نمونه متن با فونت وزیر</h2>
          <p className="font-persian leading-relaxed">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ و با استفاده از طراحان گرافیک است. 
            چاپگرها و متون بلکه روزنامه و مجله در ستون و سطرآنچنان که لازم است و برای شرایط فعلی تکنولوژی 
            مورد نیاز و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می‌باشد.
          </p>
        </div>
      </div>
    </div>
  )
} 