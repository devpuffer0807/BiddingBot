import React, { useState, useRef, useEffect } from "react";
import ChevronDown from "@/assets/svg/ChevronDown";
import "./task.css";

interface TraitSelectorProps {
  traits: {
    categories: Record<string, string>;
    counts: Record<string, Record<string, number>>;
  };
  onTraitSelect: (selectedTraits: Record<string, string[]>) => void;
  initialSelectedTraits?: Record<string, string[]>;
}

const TraitSelector: React.FC<TraitSelectorProps> = ({
  traits,
  onTraitSelect,
  initialSelectedTraits = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTraits, setSelectedTraits] = useState<
    Record<string, string[]>
  >(initialSelectedTraits);

  const toggleCategory = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const filteredTraits = selectedCategory
    ? Object.entries(traits.counts[selectedCategory]).filter(([trait]) =>
        trait.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTraitToggle = (category: string, trait: string) => {
    const updatedTraits = { ...selectedTraits };
    if (!updatedTraits[category]) {
      updatedTraits[category] = [];
    }
    const index = updatedTraits[category].indexOf(trait);
    if (index > -1) {
      updatedTraits[category].splice(index, 1);
    } else {
      updatedTraits[category].push(trait);
    }
    if (updatedTraits[category].length === 0) {
      delete updatedTraits[category];
    }
    setSelectedTraits(updatedTraits);
    onTraitSelect(updatedTraits);
  };

  const getSelectedTraitsCount = () => {
    return Object.values(selectedTraits).reduce(
      (acc, traits) => acc + traits.length,
      0
    );
  };

  const isCategorySelected = (category: string) => {
    return selectedTraits[category] && selectedTraits[category].length > 0;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full border rounded-lg shadow-sm p-3 border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] text-left flex justify-between items-center hover:bg-Neutral/Neutral-400-[night] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {getSelectedTraitsCount() > 0
            ? `${getSelectedTraitsCount()} traits selected`
            : "Select traits"}
        </span>
        <ChevronDown />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] max-h-80 overflow-y-auto custom-scrollbar p-0.5">
          <div className="sticky top-0 z-20 bg-Neutral/Neutral-300-[night]">
            <input
              type="text"
              placeholder="Search traits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded w-full p-3 bg-n-7"
            />
          </div>

          <div className="max-h-72 overflow-y-auto">
            {Object.keys(traits.categories).map((category) => (
              <div
                key={category}
                className={`mb-2 ${
                  isCategorySelected(category) ? "bg-highlight" : ""
                }`}
              >
                <div
                  onClick={() => toggleCategory(category)}
                  className={`cursor-pointer p-3 transition-colors my-2 hover:bg-Neutral/Neutral-400-[night] ${
                    isCategorySelected(category) ? "bg-Brand/Brand-1" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category}</span>
                    <div className="flex items-center">
                      <span className="mr-2">
                        {traits.counts[category] &&
                          Object.keys(traits.counts[category]).length}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          selectedCategory === category ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
                {selectedCategory === category && (
                  <div className="ml-4">
                    {filteredTraits.map(([trait, count]) => (
                      <div
                        key={trait}
                        onClick={() => handleTraitToggle(category, trait)}
                        className="cursor-pointer p-3 transition-colors my-2 hover:bg-Brand/Brand-1 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <div className="relative mr-2">
                            <input
                              type="checkbox"
                              checked={
                                selectedTraits[category]?.includes(trait) ||
                                false
                              }
                              className="sr-only"
                              onChange={() => {}} // Add empty onChange to suppress React warning
                            />
                            <div
                              className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${
                                selectedTraits[category]?.includes(trait)
                                  ? "bg-Brand/Brand-1 border-Brand/Brand-1"
                                  : "border-gray-400"
                              }`}
                            >
                              {selectedTraits[category]?.includes(trait) && (
                                <svg
                                  className="w-3 h-3 text-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                          </div>
                          <span>{trait}</span>
                        </div>
                        <span>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TraitSelector;
