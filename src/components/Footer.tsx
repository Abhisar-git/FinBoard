export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
        <p>© 2025 FinBoard. Built for Assignment.</p>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}