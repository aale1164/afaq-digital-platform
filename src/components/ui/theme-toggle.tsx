"use client";

import { Moon, Sun } from "lucide-react";
import { useState } from "react";

export function ThemeToggle() {
  const [light, setLight] = useState(false);

  function toggle() {
    const next = document.documentElement.dataset.theme !== "light";
    setLight(next);
    if (next) document.documentElement.dataset.theme = "light";
    else delete document.documentElement.dataset.theme;
    localStorage.setItem("afaq-theme", next ? "light" : "dark");
  }

  return (
    <button type="button" onClick={toggle} className="btn-ghost h-10 min-h-10 w-10 p-0" aria-label={light ? "تفعيل الوضع الداكن" : "تفعيل الوضع الفاتح"}>
      {light ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
    </button>
  );
}
