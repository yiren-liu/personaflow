import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useState } from "react";

import PaperComponent from "../paperComponent";
import { LiteratureNodeData } from "../../../../types/api";
import {
  // getPaperInfoByDOI,
  // getPaperInfoSearch,
  useApi,
} from "../../../../controllers/API";
import PaperDropdownMenu from "./components/PaperDropdownMenu";

// var _ = require("lodash");
import * as _ from "lodash";

export default function PaperListComponent({ value, onChange, disabled }) {
  const { getPaperInfoByDOI, getPaperInfoSearch } = useApi();
  const [inputList, setInputList] = useState(value ?? [""]);
  // States for search dropdown menu
  // const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownIdx, setShowDropdownIdx] = useState(-1); // Index of input field that is currently showing the dropdown, -1 if none
  const [searchResults, setSearchResults] = useState([]);

  // Function to handle paper selection
  const handlePaperSelect = (paper: LiteratureNodeData, idx) => {
    if (paper.title === "loading...") {
      return;
    }
    // Update input list with selected paper
    setInputList((old) => {
      let newInputList = _.cloneDeep(old);
      newInputList[idx] = paper;
      onChange(newInputList);
      return newInputList;
    });
    setShowDropdownIdx(-1);
  };
  const debouncedGetPaperInfoSearch = useCallback(
    _.debounce((value, idx) => {
      getPaperInfoSearch(value)
        .then((result) => {
          const data = result.data; // result.data is a list of paper info
          if (data) {
            setSearchResults(data); // Update search results
            setShowDropdownIdx(idx); // Show dropdown
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }, 500), // 500 ms delay
    [],
  );

  return (
    <div
      className={
        (disabled ? "pointer-events-none cursor-not-allowed" : "") +
        "flex max-h-[50rem] flex-col gap-3 overflow-y-scroll"
      }
    >
      {inputList.map((i, idx) => (
        <div key={idx} className="flex w-full gap-3">
          {typeof i !== "object" ? (
            <div className="flex grow flex-col items-center">
              <input
                type="text"
                value={i}
                className={
                  "form-input block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" +
                  (disabled ? " bg-gray-200" : "")
                }
                placeholder="Enter keywords to search for papers..."
                onChange={(e) => {
                  setInputList((old) => {
                    let newInputList = _.cloneDeep(old);
                    newInputList[idx] = e.target.value;
                    onChange(newInputList);

                    // for search dropdown menu
                    const dummyLitData: LiteratureNodeData = {
                      title: "loading...",
                      authors: ["loading..."],
                      abstract: "loading...",
                    };
                    setSearchResults([dummyLitData]); // Update search results
                    setShowDropdownIdx(idx); // Show dropdown

                    // get paper info from search
                    debouncedGetPaperInfoSearch(e.target.value, idx);

                    return newInputList;
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setInputList((old) => {
                      let newInputList = _.cloneDeep(old);

                      const dummyLitData: LiteratureNodeData = {
                        title: "loading...",
                        authors: ["loading..."],
                        abstract: "loading...",
                      };
                      // setSearchResults([dummyLitData]); // Update search results
                      // setShowDropdown(true); // Show dropdown

                      getPaperInfoSearch(newInputList[idx])
                        .then((result) => {
                          const data = result.data; // result.data is a list of paper info
                          if (data) {
                            newInputList[idx].title = data[0].title;
                            newInputList[idx].authors = data[0].authors;
                            newInputList[idx].abstract = data[0].abstract;
                          }
                          setInputList((old) => {
                            let newInputList = _.cloneDeep(old);
                            newInputList[idx] = dummyLitData;

                            onChange(newInputList);
                            return newInputList;
                          });
                          // if (data) {
                          //   setSearchResults(data); // Update search results
                          //   setShowDropdown(true); // Show dropdown
                          // }
                        })
                        .catch((err) => {
                          console.log(err);
                        });

                      newInputList[idx] = dummyLitData;

                      onChange(newInputList);
                      return newInputList;
                    });
                  }
                }}
              />

              {showDropdownIdx === idx && (
                // <div className="relative flex justify-center">
                <PaperDropdownMenu
                  searchResults={searchResults}
                  onSelectPaper={handlePaperSelect}
                  idx={idx}
                />
                // </div>
              )}
            </div>
          ) : (
            <PaperComponent
              value={i}
              onChange={(newPaper) => {
                setInputList((old) => {
                  let newInputList = _.cloneDeep(old);
                  newInputList[idx] = newPaper;

                  onChange(newInputList);

                  return newInputList;
                });
              }}
            />
          )}

          {idx === inputList.length - 1 ? (
            <button
              onClick={() => {
                setInputList((old) => {
                  let newInputList = _.cloneDeep(old);
                  newInputList.push("");

                  onChange(newInputList);

                  return newInputList;
                });
                // onChange(inputList);
              }}
            >
              <PlusIcon className="h-4 w-4 hover:text-blue-600" />
            </button>
          ) : (
            <button
              onClick={() => {
                setInputList((old) => {
                  let newInputList = _.cloneDeep(old);
                  newInputList.splice(idx, 1);

                  onChange(newInputList);

                  return newInputList;
                });
                // onChange(inputList);
              }}
            >
              <XMarkIcon className="h-4 w-4 hover:text-red-600" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
