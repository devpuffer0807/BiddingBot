import React, { useState, useEffect, useRef } from "react";
import { useTagStore } from "@/store/tag.store";
import ChevronDown from "@/assets/svg/ChevronDown";
import "./task.css";

interface Tag {
  name: string;
  color: string;
}

interface TagFilterProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
}

const TagFilter: React.FC<TagFilterProps> = ({ selectedTags, onChange }) => {
  const { tags } = useTagStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTag = (tag: Tag) => {
    if (selectedTags.some((selected) => selected.name === tag.name)) {
      onChange(selectedTags.filter((selected) => selected.name !== tag.name));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

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

  return (
    <div className="relative w-full min-w-44" ref={dropdownRef}>
      <button
        type="button"
        className="w-full border rounded-lg shadow-sm p-3 border-n-5 bg-Neutral/Neutral-300-[night] text-left flex justify-between items-center hover:bg-Neutral/Neutral-400-[night] transition-colors min-h-[50px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex gap-1 w-full text-n-3">
          {selectedTags.length > 0
            ? selectedTags.map((tag, index) => (
                <div
                  key={index}
                  style={{ backgroundColor: tag.color }}
                  className="w-5 h-5 rounded-full"
                ></div>
              ))
            : "Filter by tags"}
        </div>
        <ChevronDown />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border rounded-lg shadow-lg border-Neutral-BG-[night] bg-Neutral/Neutral-300-[night] max-h-60 overflow-y-auto custom-scrollbar p-0.5">
          <div className="sticky top-0 z-20 bg-Neutral/Neutral-300-[night] p-2">
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded bg-n-7 text-n-3"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredTags.map((tag) => (
              <div
                key={tag.name}
                onClick={() => toggleTag(tag)}
                className={`cursor-pointer p-3 transition-colors my-2 w-full ${
                  selectedTags.some((selected) => selected.name === tag.name)
                    ? "bg-Brand/Brand-1"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4 w-full">
                  <span
                    style={{ backgroundColor: tag.color }}
                    className="w-5 h-5 rounded-full"
                  ></span>
                  <span>{tag.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagFilter;
