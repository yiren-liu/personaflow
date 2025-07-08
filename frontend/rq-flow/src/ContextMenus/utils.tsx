import { NodeType } from "../types/flow"

export const formatPersonaData = (node: NodeType) => {
    // assembles the persona data into a text narrative format
    const personaName = node.data.node.template.persona_name.value as string
    const personaUserInstruction = node.data.node.template.userInstructions as string
    
    // const personaRole = node.data.node.template.roleTasks
    // const personaBackground =node.data.node.template.background
    let personaRole = []
    let personaBackground = []
    node.data.node.template.roleTasks.forEach((roleTask: any) => {
        personaRole.push(`${roleTask.key}: ${roleTask.value}\n`)
    })
    node.data.node.template.background.forEach((background: any) => {
        personaBackground.push(`${background.key}: ${background.value}\n`)
    })
    personaRole = personaRole.join('')
    personaBackground = personaBackground.join('')

    const description = `Persona: ${personaName}\n\nRole and Tasks: ${personaRole}\n\nBackground: ${personaBackground}\n\nUser Instructions: ${personaUserInstruction}`
    return description
}
