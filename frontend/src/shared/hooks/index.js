import React, { useState, useEffect } from "react";

function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowWidth;
}

function useClickOutside(refs, isOpen, handler) {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      const isInside = refs.some((ref) => ref.current?.contains(event.target));

      if (isInside) return;

      handler();
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs, isOpen, handler]);
}

export { useWindowWidth, useClickOutside };
