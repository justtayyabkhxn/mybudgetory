import { Github, Play } from "lucide-react";

export default function GetStartedButton() {
  return (
        <div className="flex gap-4 mt-10 justify-center">
          <a
            href="https://mybudgetory.vercel.app/signup"
            className="bg-white dark:bg-gray-900 px-4 py-3 rounded-xl shadow hover:shadow-lg transition text-center font-semibold text-green-700 dark:text-green-300 cursor-pointer flex items-center gap-2"
          >
            <Play size={18} />
            <span>

            Get Started
            </span>
          </a>

          <a
            href="https://github.com/justtayyabkhxn/mybudgetory"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-white dark:bg-green-300 px-4 py-3 rounded-xl shadow hover:shadow-lg transition text-center font-semibold text-green-700 dark:text-green-900 cursor-pointer flex items-center gap-2">
              <Github size={18} />
              <span>

               Read Docs
              </span>
            </button>
          </a>
        </div>
  );
}
