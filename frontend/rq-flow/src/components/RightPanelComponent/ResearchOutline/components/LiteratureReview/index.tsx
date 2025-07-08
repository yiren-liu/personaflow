import React from "react"
import { Typography, Link, List, ListItem } from "@mui/material"

const LiteratureReview = ({ content }: { content: Map<string, string> }) => {
  // Updated regex to handle URLs properly
  const urlRegex = /(https?:\/\/[^\s)]+)/g

  const renderTextWithLinks = (text) => {
    const parts = text.split(urlRegex)
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <Link
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
          >
            [Link]
          </Link>
        )
      }
      return part
    })
  }

  // return <Typography variant="body2">{renderTextWithLinks(text)}</Typography>

  // iterate over the content and render the text with links
  return <>
    <List sx={{ listStyleType: 'disc' }}>
      {
        content && Object.keys(content).map((key, index) => {
          return (
            <ListItem key={index}>
              <Typography key={index} variant="body2">
                <b>{key}: </b>
                {renderTextWithLinks(content[key])}
              </Typography>
            </ListItem>
          )
        })
      }
    </List>
  </>
}

export default LiteratureReview
