import { useContext, useEffect, useState } from "react";
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { map } from "lodash";

import { contextMenuContext } from "../../../../contexts/contextMenuContext";

// var _ = require("lodash");
import * as _ from "lodash";

export default function PaperComponent({ value, onChange }) {
  // the value is a dict that stores the paper info: {title, authors, abstract, year, doi, url}
  // onChange is a function that modifies the value

  // this component is a card that displays the paper info
  useEffect(() => {
    // onChange(value);
  }, [value, onChange]);

  return (
    <>
      <Card className="mt-6 w-full text-sm">
        <CardBody 
          className="nowheel m-3 flex max-h-64 flex-col gap-3 overflow-y-auto"
        >
          {value.title && (
            <Typography 
                variant="h5" 
                className="font-bold m-2 hover:underline cursor-pointer text-blue-500"
                onClick={() => { window.open(value.url, '_blank') }}
            >
                {value.title}
            </Typography>
          )}
          {value.authors && (
            <Typography variant="subtitle1" className="italic m-2">
              Authors: <br/> {value.authors.join(", ")}
            </Typography>
          )}
          {value.abstract && (
            <Typography className="text-justify m-2">
              Abstract: <br/> {value.abstract}
            </Typography>
          )}
          {value.year && <Typography>Year: {value.year}</Typography>}
          {value.doi && (
            <Typography
              as="a"
              href={`https://doi.org/${value.doi}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              DOI: {value.doi}
            </Typography>
          )}
          {/* {value.url && (
            <Typography
              as="a"
              href={value.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              URL: {value.url}
            </Typography>
          )} */}
        </CardBody>
      </Card>
    </>
  );
}
