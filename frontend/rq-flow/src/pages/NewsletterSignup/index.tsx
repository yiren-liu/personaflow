'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FaBrain, FaMicrochip, FaLeaf, FaBolt, FaFlask } from 'react-icons/fa'
import { useApi } from '@/controllers/API'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from "@/components/ui/toaster"

export default function NewsletterSignup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [otherTopic, setOtherTopic] = useState('')
  const [otherTopicChecked, setOtherTopicChecked] = useState(false)
  const [keywords, setKeywords] = useState<string[]>(["Natural Language Processing", "Quantum Algorithms", "CRISPR Technology", "Renewable Energy", "Neural Networks"])
  const [complexity, setComplexity] = useState(50)
  const [style, setStyle] = useState('casual')
  const [currentKeyword, setCurrentKeyword] = useState('')
  const [isAddingKeyword, setIsAddingKeyword] = useState(false)
  const [frequency, setFrequency] = useState('weekly')
  const [stylePreview, setStylePreview] = useState('This is a casual preview of the newsletter content.')
  const [familiarity, setFamiliarity] = useState(0)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const { subscribeToNewsletter } = useApi()
  const { toast } = useToast()

  const topics_list = ["Artificial Intelligence", "Human-Computer Interaction", "AR/VR/XR", "Natural Language Processing", "Neuroscience"]

  const popularKeywords = ["Machine Learning", "Explainable AI (XAI)", "Genetic Editing", "Cognitive Science"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // console.log({ name, email, topics, keywords, complexity, style })

    // check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    subscribeToNewsletter({ email, preferred_topics: topics, keywords, familiarity: familiarity.toString(), subscription_frequency: frequency })

    toast({
      title: 'Thank you for signing up!',
      description: 'You will receive an email with the latest research insights shortly.',
    })
    setSignupSuccess(true)
  }

  const handleKeywordAdd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentKeyword.trim()) {
      e.preventDefault()
      setKeywords([...keywords, currentKeyword.trim()])
      setCurrentKeyword('')
    }
  }

  const handleAddKeywordClick = () => {
    setIsAddingKeyword(true)
  }

  const handleKeywordConfirm = () => {
    if (currentKeyword.trim()) {
      setKeywords([...keywords, currentKeyword.trim()])
      setCurrentKeyword('')
    }
    setIsAddingKeyword(false)
  }

  const handleCancelKeyword = () => {
    setCurrentKeyword('')
    setIsAddingKeyword(false)
  }

  const handleStyleChange = (value: string) => {
    setStyle(value)
    switch(value) {
      case 'casual':
        setStylePreview('This is a casual preview of the newsletter content.')
        break
      case 'formal':
        setStylePreview('This is a formal preview of the newsletter content.')
        break
      case 'technical':
        setStylePreview('This is a technical preview of the newsletter content.')
        break
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-100 flex">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Sign Up for Our Personalized Multimodal Research Newsletter</h1>
              <p className="mt-2 text-lg text-gray-600">Get curated research insights delivered right to your inbox.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label> 
                <span className="text-red-500 ">*</span>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="topics">
                  Preferred Topics
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <span className="ml-1 text-gray-400 cursor-pointer">?</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select topics you're interested in.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {topics_list.map((topic) => (
                    <div key={topic} className="flex items-center">
                      <Checkbox
                        id={topic}
                        checked={topics.includes(topic)}
                        onCheckedChange={(checked) => {
                          setTopics(
                            checked
                              ? [...topics, topic]
                              : topics.filter((t) => t !== topic)
                          )
                        }}
                      />
                      <label htmlFor={topic} className="ml-2 text-sm text-gray-700 flex items-center">
                        {topic === 'Artificial Intelligence' && <FaMicrochip className="mr-1" />}
                        {topic === 'Human-Computer Interaction' && <FaBrain className="mr-1" />}
                        {topic === 'AR/VR/XR' && <FaBolt className="mr-1" />}
                        {topic === 'Natural Language Processing' && <FaLeaf className="mr-1" />}
                        {topic === 'Neuroscience' && <FaFlask className="mr-1" />}
                        {topic}
                      </label>
                    </div>
                  ))}
                  <div className="flex items-center">
                    <Checkbox
                      id="other"
                      checked={otherTopicChecked}
                      onCheckedChange={(checked) => {
                        setOtherTopicChecked(checked as boolean)
                      }}
                    />
                    <label htmlFor="other" className="ml-2 text-sm text-gray-700">
                      Other
                    </label>
                    {otherTopicChecked && (
                      <input
                        type="text"
                        className="ml-2 border border-gray-300 rounded p-1"
                        placeholder="Specify other topic"
                        onChange={(e) => {
                          const otherTopic = e.target.value;
                          setOtherTopic(otherTopic)
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="keywords">
                  Your Interests
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1 text-gray-400 cursor-pointer">?</span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter a short statement of your interests for more personalized content.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="keywords"
                  value={currentKeyword}
                  onChange={(e) => setCurrentKeyword(e.target.value)}
                  placeholder="I'm interested in reading about Human-AI co-creation ..."
                  className="mt-2"
                />
              </div>
              {/* <div>
                <Label>Complexity Level</Label>
                <Slider
                  value={[complexity]}
                  onValueChange={(value) => setComplexity(value[0])}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                </div>
              </div> */}
              {/* <div>
                <Label>Preferred Style</Label>
                <RadioGroup value={style} onValueChange={handleStyleChange} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="casual" id="casual" />
                    <Label htmlFor="casual">Casual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="formal" id="formal" />
                    <Label htmlFor="formal">Formal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="technical" id="technical" />
                    <Label htmlFor="technical">Technical</Label>
                  </div>
                </RadioGroup>
                <div className="mt-2 p-4 border rounded">
                  <p className="text-gray-700">{stylePreview}</p>
                </div>
              </div> */}
              <div>
                <Label>What is the style of the newsletter you are looking for?</Label>
                <RadioGroup
                  value={familiarity.toString()}
                  onValueChange={(value) => setFamiliarity(parseInt(value))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="overview" />
                    <Label htmlFor="overview">Overview</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="technical" />
                    <Label htmlFor="technical">Technical</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg"
                onClick={handleSubmit}
                disabled={signupSuccess}
              >
                Sign Up
              </Button>
            </form>
            <p className="mt-8 text-xs text-center text-gray-500" style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>
              By signing up, you agree to our Terms of Service and Privacy Policy. We'll never share your information without your permission.
            </p>
          </div>
        </div>
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="max-w-md text-center">
            {/* <svg
              className="mx-auto h-48 w-48 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg> */}
            <img src="logos/newsletter.jpg" alt="SALT Lab Logo" className="mx-auto h-48 w-48 rounded-full" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">SALT Lab Newsletter</h2>
            <p className="mt-2 text-lg text-gray-600">
              Weekly personalized research insights
            </p>
          </div>
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}