import React, { useEffect, useState, useContext } from "react"
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  Modal,
  Divider,
} from "@mui/material"
import { contextMenuContext } from "../../../contexts/contextMenuContext"
import { TabsContext } from "../../../contexts/tabsContext"
import { DeleteIcon, PlusSquareIcon } from "@chakra-ui/icons"
import AddPaperModal from "./components/AddPaperModal"
import InteractiveTutorialComponent from "../../../pages/FlowPage/components/InteractiveTutorialComponent"
import { InteractiveTutorialContext } from "../../../contexts/InteractiveTutorialContext"
import { useApi } from "../../../controllers/API"
import { locationContext } from "../../../contexts/locationContext"

// Utility function to capitalize the first letter of each word
const capitalizeTitle = (title) => {
  if (!title) return ""
  return title
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

// truncate the title if it is too long
const truncateTitle = (title) => {
  if (!title) return ""
  return title.length > 50 ? title?.substring(0, 50) + "..." : title
}

const LiteratureInfo = ({ isCollapsed, setIsCollapsed }) => {
  const { saveLog } = useApi()
  const { save } = useContext(TabsContext)
  const { currentNode } = useContext(contextMenuContext)
  const [papers, setPapers] = useState(
    currentNode?.data?.node?.template?.paper_list?.value || [],
  )
  const [selectedPaperIndex, setSelectedPaperIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { isInteractiveTutorialOpen, currentStep } = useContext(
    InteractiveTutorialContext,
  )

  const { searchParams } = useContext(locationContext)

  useEffect(() => {
    setPapers(currentNode?.data?.node?.template?.paper_list?.value || [])
    setSelectedPaperIndex(0)
  }, [currentNode])

  const handlePaperClick = (index) => {
    setSelectedPaperIndex(index)
  }

  const selectedPaper = papers[selectedPaperIndex] || {}

  const handleAddPaper = (newPaper) => {
    const newPapers = [newPaper, ...papers]
    setPapers(newPapers)
    currentNode.data.node.template.paper_list.value = newPapers
    setSelectedPaperIndex(0)
    save()
  }
  if (isCollapsed) {
    return null
  }
  // console.log(papers, "papers")

  // TODO: Add the function to allow user to modify the topic name, and add a button to refresh the paper list
  

  const childComponent = (
    <>
      <Typography
        variant="h5"
        marginX={0}
        marginTop={1}
        paddingBottom={1}
        paddingLeft={0.5}
        borderBottom="1px solid #ccc"
      >
        {currentNode?.data.node.template["paper_list"].name ? (
          <div className="flex items-center mx-2 gap-4">
            <div className="flex flex-col justify-center">
              <span className="font-bold text-gray-400 dark:text-gray-500">
                Topic:
              </span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="capitalize">
                {currentNode?.data.node.template["paper_list"].name}
              </span>
            </div>
          </div>
        ) : (
          ""
        )}
      </Typography>
      <Box display="flex" height="100%" overflow={"auto"}>
        <Box
          sx={{
            width: "35%",
            borderRight: "1px solid #ccc",
            overflowY: "auto",
            backgroundColor: "#ffffff",
            marginY: 1,
            paddingRight: 0.5,
            paddingLeft: 0.5,
          }}
        >
          <List sx={{ padding: 0 }}>
            <Button
              variant="contained"
              color="info"
              startIcon={<PlusSquareIcon />}
              size="medium"
              fullWidth={true}
              sx={{ marginTop: 0.5, marginBottom: 0.5 }}
              onClick={() => setIsModalOpen(true)}
            >
              Add Paper
            </Button>
            {papers.map((paper, index) => (
              <ListItem
                button
                key={index}
                selected={selectedPaperIndex === index}
                onClick={() => handlePaperClick(index)}
                sx={{
                  marginBottom: 0.5,
                  backgroundColor: "#f5f5f5",
                  "&.Mui-selected": {
                    backgroundColor: "#e0f7fa",
                    "&:hover": { backgroundColor: "#b2ebf2" },
                  },
                  "&:hover": { backgroundColor: "#e0f7fa" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                  }}
                >
                  <ListItemText
                    primary={truncateTitle(capitalizeTitle(paper?.title))}
                    primaryTypographyProps={{
                      fontSize: "0.9rem",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  />

                  <IconButton
                    edge="end"
                    aria-label="delete"
                    color="error"
                    onClick={() => {
                      papers.splice(index, 1)
                      setPapers([...papers])
                      currentNode.data.node.template.paper_list.value = papers
                      setSelectedPaperIndex(papers.length - 1)
                      save()
                      saveLog("DeletePaperFromLiteratureNode", {
                        node_id: currentNode.id,
                        deleted_paper_info: paper,
                        paper_list: papers,
                        searchParams: searchParams,
                      })
                    }}
                    sx={{
                      alignSelf: "flex-start",
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box
          sx={{ width: "65%", padding: 1, overflowY: "auto", height: "auto" }}
        >
          {Object.keys(selectedPaper).length !== 0 && (
            <Card elevation={0} sx={{ padding: 0 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  component="h2"
                  gutterBottom
                  sx={{ textTransform: "capitalize" }}
                  onClick={() => {
                    window.open(selectedPaper.url, "_blank")
                  }}
                  className="cursor-pointer text-blue-500 hover:underline"
                >
                  {capitalizeTitle(selectedPaper.title)}
                </Typography>

                <Divider sx={{ marginY: 1 }} />

                <Typography
                  variant="subtitle1"
                  color="textSecondary"
                  gutterBottom
                >
                  {selectedPaper?.authors?.join(", ")}
                </Typography>

                <Divider sx={{ marginY: 1 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {selectedPaper?.year && (
                    <Typography variant="subtitle2" color="textSecondary">
                      <strong>Published in:</strong> {selectedPaper?.year}
                    </Typography>
                  )}
                  {selectedPaper.venue && (
                    <Typography variant="subtitle2" color="textSecondary">
                      <strong>Venue:</strong> {selectedPaper?.venue}
                    </Typography>
                  )}
                  {selectedPaper?.citationCount && (
                    <Typography variant="subtitle2" color="textSecondary">
                      <strong>Citation Count:</strong>{" "}
                      {selectedPaper?.citationCount}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ marginY: 1 }} />

                <Typography variant="body2">
                  {selectedPaper.abstract}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <AddPaperModal onAddPaper={handleAddPaper} onClose={setIsModalOpen} />
        </Box>
      </Modal>
    </>
  )

  return isInteractiveTutorialOpen && currentStep < 8 ? (
    <InteractiveTutorialComponent targetTutorialStep={7}>
      {childComponent}
    </InteractiveTutorialComponent>
  ) : (
    childComponent
  )
}

export default LiteratureInfo
