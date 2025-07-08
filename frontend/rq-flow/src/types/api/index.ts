import { Node, Edge, Viewport } from "reactflow"
//kind and class are just representative names to represent the actual structure of the object received by the API

export type APIObjectType = { kind: APIKindType; [key: string]: APIKindType }
export type APIKindType = { class: APIClassType; [key: string]: APIClassType }
export type APITemplateType = {
  variable: TemplateVariableType
  [key: string]: TemplateVariableType
}
export type APIClassType = {
  base_classes: Array<string>
  description: string
  template: APITemplateType
  [key: string]: Array<string> | string | APITemplateType
}
export type TemplateVariableType = {
  type: string
  required: boolean
  placeholder?: string
  list: boolean
  show: boolean
  multiline?: boolean
  value?: any
  [key: string]: any
}
export type sendAllProps = {
  nodes: Node[]
  edges: Edge[]
  name: string
  description: string
  viewport: Viewport
  message: string

  chatHistory: { message: string; isSend: boolean }[]
}
export type errorsTypeAPI = {
  function: { errors: Array<string> }
  imports: { errors: Array<string> }
}
export type PromptTypeAPI = { input_variables: Array<string> }

// RQ Gen types
export type NodeData = {
  node_id: string
  type: string
  command_name: string
  arguments: Map<string, string>
  rq_text: string
  user_input: string
}

export type PersonaNodeData = {
  persona_name: string
  persona_description: string
}

export type CritiqueNodeData = {
  critique_aspect: string
  critique_detail: string
}
export type CritiqueNodeDataList = CritiqueNodeData[]

export type RQNodeData = {
  rq_text: string
}

export type FieldName = {
  name: string
}

export type TableData = {
  text: string
}

export type LiteratureNodeData = {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  topic: string;
  year: string;
};
export type LiteratureNodeDataList = LiteratureNodeData[];


export type HypotheticalAbstractResponse = {
  hypothetical_abstract: string
}

export type ResearchScenarioResponse = {
  research_scenarios: string[];
}