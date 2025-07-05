import { Github, Play } from "lucide-react";

export default function GetStartedButton() {
  return (
        <div className="flex gap-4 mt-10 justify-center">
          <button
            onClick={() =>
              document
                .getElementById("bottom")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-white dark:bg-gray-900 px-4 py-3 rounded-xl shadow hover:shadow-lg transition text-center font-semibold text-green-700 dark:text-green-300 cursor-pointer flex items-center gap-2"
          >
            <Play size={18} />
            Get Started
          </button>

          <a
            href="https://github.com/justtayyabkhxn/mybudgetory"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-white dark:bg-green-300 px-4 py-3 rounded-xl shadow hover:shadow-lg transition text-center font-semibold text-green-700 dark:text-green-900 cursor-pointer flex items-center gap-2">
              <Github size={18} /> Read Docs
            </button>
          </a>
        </div>
  );
}
