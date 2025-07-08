import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/contexts/userContext"
import { useContext } from "react"
import { alertContext } from "@/contexts/alertContext"
import { useApi } from "@/controllers/API"

export default function APISettingsModal() {
  const { settingsOpen, setSettingsOpen, isUsingSelfProvidedKey, setIsUsingSelfProvidedKey, setEncryptedCustomApiKey, customApiBaseUrl, setCustomApiBaseUrl, encryptApiKey } = useUser()
  const { setSuccessData, setErrorData } = useContext(alertContext);
  const { validateApiKey } = useApi()

  const [apiChoice, setApiChoice] = useState(isUsingSelfProvidedKey ? "custom" : "platform")
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState(customApiBaseUrl)
  const [isValidating, setIsValidating] = useState(false)
  const [isValidated, setIsValidated] = useState(false)

  // reset the key information when api choice is changed
  useEffect(() => {
    setApiKey("")
    setBaseUrl(customApiBaseUrl)
    setIsValidated(false)
    setIsValidating(false)
  }, [apiChoice])

  const handleValidate = async () => {
    setIsValidating(true)
    // Simulating API call to validate the key
    await validateApiKey(encryptApiKey(apiKey), baseUrl).then(() => {
      setIsValidating(false)
      setIsValidated(true)
      setSuccessData({
        title: "Your API key has been successfully validated.",
      })
    }).catch((error) => {
      setErrorData({
        title: "Error",
        list: [error.response.data.detail || "Please check your API key and try again."],
      })
      setIsValidating(false)
    })
  }

  const handleSave = () => {
    if (apiChoice === "custom" && !isValidated) {
      setErrorData({
        title: "Validation Required",
        list: ["Please validate your API key before saving."],
      })
      return
    }
    // Save logic here
    if (apiChoice === "custom") { 
      setIsUsingSelfProvidedKey(true)
      setEncryptedCustomApiKey(apiKey)
      setCustomApiBaseUrl(baseUrl)
    } else {
      setIsUsingSelfProvidedKey(false)
      setEncryptedCustomApiKey(null)
      setCustomApiBaseUrl(null)
    }
    setSettingsOpen(false)
    setSuccessData({
      title: "Your API settings have been successfully saved.",
    })
  }

  return (
    <div className="py-4">
      <RadioGroup
        value={apiChoice}
        onValueChange={setApiChoice}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="platform" id="platform" />
          <Label htmlFor="platform">
            Use platform-provided service (quota: 50 requests per hour)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="custom" />
          <Label htmlFor="custom">Use my own OpenAI API key (no quota limit)</Label>
        </div>
      </RadioGroup>
      {apiChoice === "custom" && (
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Your OpenAI API Key (we will never store your API key)</Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="base-url">Your Custom Base URL (optional)</Label>
            <Input
              id="base-url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="Enter API base URL (if applicable, e.g. https://api.openai.com/v1)"
            />
          </div>
          <Button
            onClick={handleValidate}
            disabled={isValidating || !apiKey}
            className="h-6"
          >
            {isValidating ? "Validating..." : "Validate API Key"}
          </Button>
          {isValidated && (
            <p className="text-sm text-green-600">
              API key successfully validated
            </p>
          )}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="h-8">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
