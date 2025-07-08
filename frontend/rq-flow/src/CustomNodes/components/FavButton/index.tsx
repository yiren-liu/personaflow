import { useContext, useEffect, useState } from "react"

import { useApi } from "../../../controllers/API"
import { contextMenuContext } from "../../../contexts/contextMenuContext"
import { NodeDataType, NodeType } from "../../../types/flow"

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder"
import FavoriteIcon from "@mui/icons-material/Favorite"
import { IconButton } from "@mui/material"

const FavButton = ({ nodeData }: { nodeData: NodeDataType }) => {
  const { saveLog } = useApi()
  const {} = useContext(contextMenuContext)

  // load the favorited state from node data
  const [favorited, setFavorited] = useState<boolean>(false)
  useEffect(() => {
    if (nodeData?.favorited) {
      setFavorited(nodeData.favorited)
    }
  }, [nodeData?.favorited])

  return (
    <div className="space-y-2">
      {!favorited ? (
        <IconButton
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setFavorited(true)
            nodeData.favorited = true
            saveLog("NodeFavorited", { node_id: nodeData.id })
          }}
          className="text-gray-500"
        >
          <FavoriteBorderIcon sx={{ fontSize: "2rem" }} />
        </IconButton>
      ) : (
        <IconButton
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setFavorited(false)
            nodeData.favorited = false
            saveLog("NodeUnfavorited", { node_id: nodeData.id })
          }}
          className="text-red-500"
        >
          <FavoriteIcon sx={{ fontSize: "2rem" }} />
        </IconButton>
      )}
    </div>
  )
}

export default FavButton
