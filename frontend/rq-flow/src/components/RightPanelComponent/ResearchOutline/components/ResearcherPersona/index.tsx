// import * as React from "react";
// import {
//   DataGrid,
//   GridColDef,
//   GridRowsProp,
//   GridRowModesModel,
//   GridRowModes,
//   GridActionsCellItem,
//   GridEventListener,
//   GridRowId,
//   GridRowModel,
//   GridRowEditStopReasons,
// } from "@mui/x-data-grid";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/DeleteOutlined";
// import SaveIcon from "@mui/icons-material/Save";
// import { Cancel } from "@mui/icons-material";
// import AddIcon from "@mui/icons-material/Add";
// import { Box, Button, CircularProgress } from "@mui/material";
// import { randomTraderName, randomId } from "@mui/x-data-grid-generator";

// const rowsa: GridRowsProp = [
//   {
//     id: 1,
//     section: randomTraderName(),
//     description: randomTraderName(),
//   },
//   {
//     id: 2,
//     section: randomTraderName(),
//     description: randomTraderName(),
//   },
// ];

// export default function OutlineTable() {
//   const [rows, setRows] = React.useState(rowsa);
//   const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
//     {},
//   );

//   const handleEditClick = (id: GridRowId) => () => {
//     setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
//   };

//   const handleSaveClick = (id: GridRowId) => async () => {
//     // Simulate API call to fetch description data
//     setRows((prevRows) =>
//       prevRows.map((row) =>
//         row.id === id
//           ? {
//               ...row,
//               description: (
//                 <Box>
//                   <CircularProgress size={20} />
//                 </Box>
//               ),
//             }
//           : row,
//       ),
//     );

//     await new Promise((resolve) => setTimeout(resolve, 2000));

//     setRows((prevRows) =>
//       prevRows.map((row) =>
//         row.id === id ? { ...row, description: randomTraderName() } : row,
//       ),
//     );

//     setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
//   };

//   const handleDeleteClick = (id: GridRowId) => () => {
//     setRows((prevRows) => prevRows.filter((row) => row.id !== id));
//   };

//   const handleCancelClick = (id: GridRowId) => () => {
//     setRowModesModel({
//       ...rowModesModel,
//       [id]: { mode: GridRowModes.View, ignoreModifications: true },
//     });

//     const editedRow = rows.find((row) => row.id === id);
//     if (editedRow!.isNew) {
//       setRows((prevRows) => prevRows.filter((row) => row.id !== id));
//     }
//   };

//   const processRowUpdate = (newRow: GridRowModel) => {
//     const updatedRow = { ...newRow, isNew: false };
//     setRows((prevRows) =>
//       prevRows.map((row) => (row.id === newRow.id ? updatedRow : row)),
//     );
//     return updatedRow;
//   };

//   const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
//     setRowModesModel(newRowModesModel);
//   };

//   const handleAddClick = () => {
//     const id = randomId();
//     const newRow = { id, section: "", description: "", isNew: true };
//     setRows((prevRows) => [...prevRows, newRow]);
//     setRowModesModel((prevModel) => ({
//       ...prevModel,
//       [id]: { mode: GridRowModes.Edit, fieldToFocus: "section" },
//     }));
//   };

//   const columns: GridColDef[] = [
//     {
//       field: "section",
//       headerName: "Section",
//       headerAlign: "center",
//       flex: 0.5,
//       editable: false,
//       filterable: false,
//       pinnable: false,
//       sortable: false,
//       disableColumnMenu: true,
//       resizable: false,
//       headerClassName: "column-header",
//     },
//     {
//       field: "description",
//       headerName: "Description",
//       editable: true,
//       headerAlign: "center",
//       flex: 1,
//       filterable: false,
//       pinnable: false,
//       sortable: false,
//       disableColumnMenu: true,
//       resizable: false,
//       headerClassName: "column-header",
//     },
//     {
//       field: "actions",
//       type: "actions",
//       headerName: "Actions",
//       width: 100,
//       cellClassName: "actions",
//       headerAlign: "center",
//       getActions: ({ id }) => {
//         const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

//         if (isInEditMode) {
//           return [
//             <GridActionsCellItem
//               icon={<SaveIcon />}
//               label="Save"
//               sx={{ color: "primary.main" }}
//               onClick={handleSaveClick(id)}
//             />,
//             <GridActionsCellItem
//               icon={<Cancel />}
//               label="Cancel"
//               className="textPrimary"
//               onClick={handleCancelClick(id)}
//               color="inherit"
//             />,
//           ];
//         }

//         return [
//           <GridActionsCellItem
//             icon={<EditIcon />}
//             label="Edit"
//             className="textPrimary"
//             onClick={handleEditClick(id)}
//             color="inherit"
//           />,
//           <GridActionsCellItem
//             icon={<DeleteIcon />}
//             label="Delete"
//             onClick={handleDeleteClick(id)}
//             color="inherit"
//           />,
//         ];
//       },
//     },
//   ];

//   return (
//     <Box sx={{ width: "100%", marginTop: "1rem" }}>
//       <DataGrid
//         rows={rows}
//         columns={columns}
//         hideFooterPagination={true}
//         hideFooterSelectedRowCount={true}
//         hideFooter={true}
//         getRowHeight={() => "auto"}
//         autoHeight={true}
//         disableRowSelectionOnClick={true}
//         rowModesModel={rowModesModel}
//         onRowModesModelChange={handleRowModesModelChange}
//         processRowUpdate={processRowUpdate}
//         sx={{
//           ".MuiDataGrid-cell": {
//             py: 1,
//             borderRight: "1px solid #ccc",
//           },
//           ".MuiDataGrid-columnHeader": {
//             borderRight: "1px solid #ccc",
//             borderTop: "none",
//           },
//           ".MuiDataGrid-columnHeaderTitle": {
//             fontWeight: "bolder",
//           },
//         }}
//       />
//       <Button
//         startIcon={<AddIcon />}
//         onClick={handleAddClick}
//         variant="text"
//         fullWidth
//         sx={{ textAlign: "left" }}
//       >
//         Add Section
//       </Button>
//     </Box>
//   );
// }

import React, { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";

import { OutlineTableRow } from "../../../../../types/blocks";
import { useApi } from "../../../../../controllers/API";
import { alertContext } from "../../../../../contexts/alertContext";
import { nodesWithDepthType } from "../../../../../types/typesContext";
import { locationContext } from "../../../../../contexts/locationContext";

export default function OutlineTable({
  rows,
  setRows,
  researchOutline, 
  setResearchOutline,
  rqNodeData,
  personaNodeData,
  critiqueNodeData,
  literatureNodeDataList,
  ancestorNodesWithDepth,
  currScenarioes,
  currScenarioIndex,
}: {
  rows: OutlineTableRow[];
  setRows: React.Dispatch<React.SetStateAction<OutlineTableRow[]>>;
  researchOutline: Map<string, string>[] | null;
  setResearchOutline: React.Dispatch<React.SetStateAction<Map<string, string>[] | null>>;
  rqNodeData: any;
  personaNodeData: any;
  critiqueNodeData: any;
  literatureNodeDataList: any;
  ancestorNodesWithDepth: nodesWithDepthType[];
  currScenarioes: any;
  currScenarioIndex: number;
}) {
  const { getAdditionalField, saveLog } = useApi();
  const { setErrorData } = useContext(alertContext);
  const [newSection, setNewSection] = useState<string>("");

  const { searchParams } = useContext(locationContext);

  const addRow = () => {
    if (newSection.trim() === "") return;

    const newRow: OutlineTableRow = {
      section: newSection,
      description: "",
      isNew: true,
      isEditing: false,
      isLoading: true,
    };

    setRows((prevRows) => [...prevRows, newRow]);
    setNewSection("");

    // API call here to fetch the new row data
    const tableData = {text: rows.map((row) => "Section: " + row.section + "\t Description: " + row.description).join("\n")};
    const fieldName = {name: newSection};
    getAdditionalField(
      fieldName,
      rqNodeData,
      personaNodeData,
      critiqueNodeData,
      literatureNodeDataList,
      tableData,
      ancestorNodesWithDepth,
      [currScenarioes[currScenarioIndex].scenario],
    ).then((res) => {
      setRows((prevRows) =>
        prevRows.map((row, index) =>
          index === prevRows.length - 1
            ? { ...row, description: res.data['description'], isNew: false, isLoading: false }
            : row,
        ),
      )
      // sync rows with researchOutline using setResearchOutline
      setResearchOutline((prevResearchOutline) => {
        if (prevResearchOutline === null) return null;
        const newResearchOutline = [...prevResearchOutline];
        newResearchOutline.push({title: newSection, description: res.data['description']} as unknown as Map<string, string>);
        return newResearchOutline;
      });
    }).catch((err) => {
        setErrorData({
          title: "Error",
          list: [err.message],
        });
      });
  };

  const saveRow = (index: number) => {
    const updatedRows = rows.map((row, idx) =>
      idx === index ? { ...row, isEditing: false } : row,
    );
    setRows(updatedRows);

    saveLog(
      "EditResearchOutlineRow",
      {
        node_id: rqNodeData.id,
        section: rows[index].section,
        description: rows[index].description,
        searchParams: searchParams
      }
    )
  };

  const editRow = (index: number) => {
    const updatedRows = rows.map((row, idx) =>
      idx === index ? { ...row, isEditing: true } : row,
    );
    setRows(updatedRows);
  };

  const deleteRow = (index: number) => {
    const updatedRows = rows.filter((_, idx) => idx !== index);
    setRows(updatedRows);

    saveLog(
      "DeleteResearchOutlineRow",
      {
        node_id: rqNodeData.id,
        section: rows[index].section,
        description: rows[index].description,
        searchParams: searchParams
      }
    )
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const updatedRows = rows.map((row, idx) =>
      idx === index ? { ...row, description: value } : row,
    );
    setRows(updatedRows);
  };

  return (
    <div className="container mx-auto mt-4">
      <table className="min-w-full  border-gray-300 bg-white">
        <thead>
          <tr>
            <th className="w-1/5 border px-4 py-2">Section</th>
            <th className="w-3/5 border px-4 py-2">Description</th>
            <th className="w-1/5 border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="border px-4 py-2 font-bold">{row.section}</td>
              <td className="border px-4 py-2">
                {row.isLoading ? (
                  <CircularProgress size={24} />
                ) : row.isEditing ? (
                  <TextField
                    value={row.description}
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                    multiline
                    rows={4}
                    fullWidth
                  />
                ) : (
                  <div className="whitespace-pre-line text-xs">
                    {row.description}
                  </div>
                )}
              </td>
              <td className="border px-4 py-2">
                <div className="flex justify-evenly space-x-1 ">
                  {row.isLoading ? null : row.isEditing ? (
                    <IconButton onClick={() => saveRow(index)}>
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton onClick={() => editRow(index)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton onClick={() => deleteRow(index)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
          <tr>
            <td className="" colSpan={3}>
              <div className="flex content-end justify-start">
                <TextField
                  label="New Section"
                  variant="standard"
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value)}
                  sx={{
                    width: "25%",
                    marginLeft: "0.5rem",
                    paddingRight: "1.5rem",
                  }}
                />
                <IconButton
                  onClick={addRow}
                  edge="start"
                  sx={{ alignItems: "end", height: "auto", paddingY: 0 }}
                  disableTouchRipple={true}
                >
                  <AddIcon sx={{}} />
                </IconButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
