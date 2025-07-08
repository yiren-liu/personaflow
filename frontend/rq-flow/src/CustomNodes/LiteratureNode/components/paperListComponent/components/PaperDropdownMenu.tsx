import React from "react";

const PaperDropdownMenu = ({ searchResults, onSelectPaper, idx }) => {
  return (
    <div className="max-w-128 dropdown-menu nowheel absolute w-auto z-10 mt-10 rounded-md bg-white shadow-lg">
      <ul className="max-h-60 overflow-auto text-base leading-6 shadow-xs">
        {searchResults?.paper_list?.map((paper, paperIdx) => (
          <li
            key={paperIdx}
            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
            onClick={() => onSelectPaper(paper, idx)}
          >
            <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                <a 
                  className="block truncate font-medium hover:underline cursor-pointer text-blue-500"
                  onClick={(e) => { 
                    window.open(paper.url, '_blank');
                  }}
                >
                    {paper.title}
                </a>
            </div>
            <div className="mt-1">
              <span className="block text-xs text-gray-500">
                Authors: {paper.authors.join(', ')}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PaperDropdownMenu;