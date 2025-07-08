import React, { useState, useCallback, useContext } from "react";
import {
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import * as _ from "lodash";
import { useApi } from "../../../../../controllers/API";
import { locationContext } from "../../../../../contexts/locationContext";
import { contextMenuContext } from "../../../../../contexts/contextMenuContext";

const SearchSuggestions = ({ handleSearchResultClick, searchResults }) => {
  return (
    <Paper
      elevation={2}
      sx={{ marginTop: 1, maxHeight: 200, overflowY: "auto" }}
    >
      <List sx={{ paddingY: 0 }}>
        {searchResults?.map((result, index) => (
          <ListItem
            button={true}
            key={index}
            onClick={() => handleSearchResultClick(result)}
            sx={{ borderBottom: "1px solid #ccc" }}
          >
            <ListItemText
              primary={result.title}
              secondary={`${result.authors ? result.authors.join(", ") : ""} | Citation:${result.citationCount}`}
              primaryTypographyProps={{ textTransform: "capitalize" }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

const AddPaperModal = ({ onAddPaper, onClose }) => {
  const { getPaperInfoSearch, saveLog } = useApi();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { searchParams } = useContext(locationContext);
  const { currentNode } = useContext(contextMenuContext);

  const debouncedGetPaperInfoSearch = useCallback(
    _.debounce((value) => {
      setLoading(true);
      getPaperInfoSearch(value)
        .then((result) => {
          const data = result.data;
          if (data) {
            setSearchResults(data.paper_list);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    }, 500),
    [],
  );

  const handleSearchResultClick = (result) => {
    onAddPaper(result);
    setSearchQuery("");
    setSearchResults([]);
    onClose(false);

    saveLog("AddPaperToLiteratureNode", {
      node_id: currentNode.id,
      added_paper_info: result,
      search_paper_results: searchResults,
      search_query: searchParams,
    });
  };

  return (
    <Box sx={{ position: "relative", padding: 1 }}>
      <IconButton
        aria-label="close"
        onClick={() => onClose(false)}
        sx={{
          position: "absolute",
          right: 0,
        }}
        color="error"
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom>
        Add Paper
      </Typography>
      <TextField
        fullWidth
        placeholder="Search to add a new paper..."
        value={searchQuery}
        onChange={(e) => {
          const value = e.target.value;
          setSearchQuery(value);
          debouncedGetPaperInfoSearch(value);
        }}
        InputProps={{
          endAdornment: loading && (
            <Box sx={{ display: "flex" }}>
              <CircularProgress />
            </Box>
          ),
        }}
      />

      {searchQuery && searchResults.length > 0 && (
        <SearchSuggestions
          handleSearchResultClick={handleSearchResultClick}
          searchResults={searchResults}
        />
      )}
    </Box>
  );
};

export default AddPaperModal;
