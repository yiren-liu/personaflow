import React, { useState, useContext, useEffect } from "react"
import {
  Box,
  CardContent,
  TextField,
  Typography,
  Button,
  IconButton,
  Divider,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { PlusSquareIcon } from "@chakra-ui/icons"
import { contextMenuContext } from "../../../contexts/contextMenuContext"
import { TabsContext } from "../../../contexts/tabsContext"
import { locationContext } from "../../../contexts/locationContext"
import { useApi } from "../../../controllers/API"

const PersonaCustomizer = ({ isCollapsed }) => {
  const { saveLog } = useApi()
  const { currentNode } = useContext(contextMenuContext)
  const { save } = useContext(TabsContext)
  const [personaName, setPersonaName] = useState("")
  const [roleTaskFields, setRoleTaskFields] = useState([
    { key: "Role", value: "", default: true },
    { key: "Goal", value: "", default: true },
  ])
  const [backgroundFields, setBackgroundFields] = useState([
    { key: "Domain", value: "", default: true },
  ])
  const [newRoleTaskField, setNewRoleTaskField] = useState("")
  const [newBackgroundField, setNewBackgroundField] = useState("")
  const [userInstructions, setUserInstructions] = useState("")
  const [isSaved, setIsSaved] = useState(true) // State to manage saved state

  const { searchParams } = useContext(locationContext)

  useEffect(() => {
    setNewBackgroundField("");
    setNewRoleTaskField("");
    if (currentNode?.data?.node?.template) {
      const template = currentNode.data.node.template
      setPersonaName(template.persona_name.value || "")

      const initRoleTaskFields = [
        { key: "Role", value: "", default: true },
        { key: "Goal", value: "", default: true },
      ]
      const initBackgroundFields = [
        { key: "Domain", value: "", default: true },
      ]

      const combinedRoleTaskFields = initRoleTaskFields
        .map((field) => ({
          ...field,
          value:
            template.roleTasks?.find((t) => t.key === field.key)?.value ||
            field.value,
        }))
        .concat(
          template.roleTasks?.filter(
            (t) => !initRoleTaskFields.some((field) => field.key === t.key),
          ) || [],
        )
      setRoleTaskFields(combinedRoleTaskFields)

      const combinedBackgroundFields = initBackgroundFields
        .map((field) => ({
          ...field,
          value:
            template.background?.find((t) => t.key === field.key)?.value ||
            field.value,
        }))
        .concat(
          template.background?.filter(
            (t) => !initBackgroundFields.some((field) => field.key === t.key),
          ) || [],
        )
      setBackgroundFields(combinedBackgroundFields)

      setUserInstructions(template.userInstructions || "")
    }
  }, [currentNode])

  const handleFieldChange = (index, newValue, setFields) => {
    setFields((prevFields) =>
      prevFields.map((field, idx) =>
        idx === index ? { ...field, value: newValue } : field,
      ),
    )
    setIsSaved(false) // Indicate that changes have been made
  }

  const addField = (newField, setFields) => {
    if (newField.trim() === "") return

    // Check for duplicate keys
    if (setFields === setRoleTaskFields) {
      if (roleTaskFields.some((field) => field.key === newField)) return
    } else {
      if (backgroundFields.some((field) => field.key === newField)) return
    }

    setFields((prevFields) => [
      ...prevFields,
      { key: newField, value: "", default: false },
    ])
    setNewRoleTaskField("")
    setNewBackgroundField("")
    setIsSaved(false) // Indicate that changes have been made
  }

  const removeField = (index, setFields) => {
    setFields((prevFields) => prevFields.filter((_, idx) => idx !== index))
    setIsSaved(false) // Indicate that changes have been made
  }

  const handleSave = () => {
    currentNode.data.node.template.persona_name.value = personaName
    currentNode.data.node.template.roleTasks = roleTaskFields
    currentNode.data.node.template.background = backgroundFields
    currentNode.data.node.template.userInstructions = userInstructions
    // console.log("Saving state:", {
    //   personaName,
    //   roleTaskFields,
    //   backgroundFields,
    //   userInstructions,
    // })
    save()
    setIsSaved(true) // Mark as saved after successful save

    saveLog("EditPersona", {
      node_id: currentNode.id,
      node_data: currentNode.data,
      searchParams: searchParams,
    })
  }

  if (isCollapsed) {
    return null
  }

  return (
    <div className="overflow-y-auto bg-slate-100 p-2">
      <div className="flex flex-col">
        <Box style={{ borderRadius: "10px", backgroundColor: "white" }}>
          <CardContent>
            <Typography
              variant="h6"
              className="font-bold capitalize tracking-wide subpixel-antialiased"
            >
              Persona Name
            </Typography>
            <TextField
              value={personaName}
              onChange={(e) => {
                setPersonaName(e.target.value)
                setIsSaved(false) // Indicate that changes have been made
              }}
              fullWidth
              margin="dense"
              variant="outlined"
              size="small"
            />
            <Divider className="my-4" />
            <Typography
              variant="h6"
              className="font-sans font-bold capitalize tracking-wide subpixel-antialiased"
            >
              Role/Task of Persona
            </Typography>
            {roleTaskFields.map((field, index) => (
              <div key={index} className="flex items-center mb-2">
                {field.default ? (
                  <Typography
                    variant="body1"
                    className="mr-2"
                    style={{ minWidth: "150px", textAlign: "left" }}
                  >
                    {field.key}
                  </Typography>
                ) : (
                  <TextField
                    placeholder="New Field"
                    value={field.key}
                    onChange={(e) => {
                      const newKey = e.target.value
                      setRoleTaskFields((prevFields) =>
                        prevFields.map((f, idx) =>
                          idx === index ? { ...f, key: newKey } : f,
                        ),
                      )
                      setIsSaved(false) // Indicate that changes have been made
                    }}
                    margin="dense"
                    variant="standard"
                    size="small"
                    className="mr-2"
                    style={{ minWidth: "150px" }}
                  />
                )}
                <TextField
                  value={field.value}
                  onChange={(e) =>
                    handleFieldChange(index, e.target.value, setRoleTaskFields)
                  }
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  multiline
                />
                {!field.default && (
                  <IconButton
                    onClick={() => removeField(index, setRoleTaskFields)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            ))}
            <div className="flex items-center">
              <TextField
                label="New Role/Task Field"
                value={newRoleTaskField}
                onChange={(e) => {
                  setNewRoleTaskField(e.target.value)
                  setIsSaved(false) // Indicate that changes have been made
                }}
                margin="dense"
                variant="outlined"
                size="small"
                className="mr-2"
                fullWidth
              />
              <IconButton
                onClick={() => addField(newRoleTaskField, setRoleTaskFields)}
              >
                <PlusSquareIcon />
              </IconButton>
            </div>
            <Divider className="my-4" />
            <Typography
              variant="h6"
              className="font-bold capitalize tracking-wide subpixel-antialiased"
            >
              Persona Background
            </Typography>
            {backgroundFields.map((field, index) => (
              <div key={index} className="flex items-center mb-2">
                {field.default ? (
                  <Typography
                    variant="body1"
                    className="mr-2"
                    style={{ minWidth: "150px", textAlign: "left" }}
                  >
                    {field.key}
                  </Typography>
                ) : (
                  <TextField
                    placeholder="New Field"
                    value={field.key}
                    onChange={(e) => {
                      const newKey = e.target.value
                      setBackgroundFields((prevFields) =>
                        prevFields.map((f, idx) =>
                          idx === index ? { ...f, key: newKey } : f,
                        ),
                      )
                      setIsSaved(false) // Indicate that changes have been made
                    }}
                    margin="dense"
                    variant="standard"
                    size="small"
                    className="mr-2"
                    style={{ minWidth: "150px" }}
                  />
                )}
                <TextField
                  value={field.value}
                  onChange={(e) =>
                    handleFieldChange(
                      index,
                      e.target.value,
                      setBackgroundFields,
                    )
                  }
                  fullWidth
                  margin="dense"
                  variant="outlined"
                  size="small"
                  multiline
                />
                {!field.default && (
                  <IconButton
                    onClick={() => removeField(index, setBackgroundFields)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            ))}
            <div className="flex items-center">
              <TextField
                label="New Background Field"
                value={newBackgroundField}
                onChange={(e) => {
                  setNewBackgroundField(e.target.value)
                  setIsSaved(false) // Indicate that changes have been made
                }}
                margin="dense"
                variant="outlined"
                size="small"
                className="mr-2"
                fullWidth
              />
              <IconButton
                onClick={() =>
                  addField(newBackgroundField, setBackgroundFields)
                }
              >
                <PlusSquareIcon />
              </IconButton>
            </div>
            <Divider className="my-4" />
            <Typography
              variant="h6"
              className="font-bold capitalize tracking-wide subpixel-antialiased"
            >
              User Instructions
            </Typography>
            <div className="flex items-center mb-2">
              <Typography
                variant="body1"
                className="mr-2"
                style={{ minWidth: "150px", textAlign: "left" }}
              >
                Instructions
              </Typography>
              <TextField
                value={userInstructions}
                onChange={(e) => {
                  setUserInstructions(e.target.value)
                  setIsSaved(false) // Indicate that changes have been made
                }}
                fullWidth
                margin="dense"
                variant="outlined"
                size="small"
                multiline
              />
            </div>
            {!isSaved && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                className="mt-4"
              >
                Save
              </Button>
            )}
          </CardContent>
        </Box>
      </div>
    </div>
  )
}

export default PersonaCustomizer
