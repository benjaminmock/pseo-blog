"use client";

import { useState, useEffect, useRef } from "react";

type City = {
  id: number;
  city: string;
  zip: string;
  slug: string;
};

type CityComboboxProps = {
  onSelect: (city: City | null) => void;
  initialValue?: string;
};

export default function CityCombobox({
  onSelect,
  initialValue,
}: CityComboboxProps) {
  const [inputItems, setInputItems] = useState<City[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const initialLoadRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/cities");
        if (response.ok) {
          const data = await response.json();
          setCities(data);
          setInputItems(data);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    if (cities.length > 0 && initialValue && !initialLoadRef.current) {
      const matchingCity = cities.find(
        (city) =>
          city.slug === initialValue ||
          city.city.toLowerCase() === initialValue.toLowerCase()
      );
      if (matchingCity) {
        setSelectedCity(matchingCity);
        setInputValue(`${matchingCity.city} (${matchingCity.zip})`);
        onSelect(matchingCity);
        initialLoadRef.current = true;
      }
    }
  }, [cities, initialValue, onSelect]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        inputRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(true);

    if (!value) {
      setInputItems(cities);
      setSelectedCity(null);
      onSelect(null);
      return;
    }

    const filtered = cities.filter(
      (city) =>
        city.city.toLowerCase().includes(value.toLowerCase()) ||
        city.zip.includes(value)
    );
    setInputItems(filtered);
    setHighlightedIndex(-1);
  };

  const handleItemClick = (city: City) => {
    setInputValue(`${city.city} (${city.zip})`);
    setSelectedCity(city);
    onSelect(city);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleClearClick = () => {
    setInputValue("");
    setSelectedCity(null);
    onSelect(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex < inputItems.length - 1 ? prevIndex + 1 : prevIndex
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < inputItems.length) {
          handleItemClick(inputItems[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Stadt suchen (z.B. Berlin oder 10115)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          data-testid="city-combobox"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClearClick}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && (
        <ul
          ref={menuRef}
          className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
        >
          {isLoading ? (
            <li className="px-3 py-2 text-gray-500">Lade Städte...</li>
          ) : inputItems.length === 0 ? (
            <li className="px-3 py-2 text-gray-500">
              Keine Ergebnisse gefunden
            </li>
          ) : (
            inputItems.map((item, index) => (
              <li
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`px-3 py-2 cursor-pointer ${
                  highlightedIndex === index
                    ? "bg-indigo-100 text-indigo-900"
                    : "text-gray-900"
                }`}
              >
                {item.city} ({item.zip})
              </li>
            ))
          )}
        </ul>
      )}
      <input type="hidden" name="city_id" value={selectedCity?.id || ""} />
      <input type="hidden" name="city_slug" value={selectedCity?.slug || ""} />
    </div>
  );
}
