import { FileNode } from "@/hooks/useFileManager";
import { AboutMe } from "@/components/renders/about-me";
import { Experience } from "@/components/renders/experience";
import Reflection from "@/components/renders/reflection";
import { Hobbies } from "@/components/renders/hobbies";
import { Skills } from "@/components/renders/skills";
import MeetAI from "@/components/renders/meetai";
import GCApp from "@/components/renders/gc-app";
import CreditScoring from "@/components/renders/credit-scoring";

// Single source of truth for the home directory. The file manager renders it
// as icons; the terminal walks the same tree for ls / cd / cat.
export const FILE_TREE: FileNode[] = [
  {
    type: "folder",
    name: "projects",
    children: [
      {
        type: "folder",
        name: "meetai",
        children: [
          {
            type: "file",
            name: "preview.png",
            thumbnail: "/images/meetai.png",
            render: (
              <img
                src="/images/meetai.png"
                alt="MeetAI dashboard"
                className="w-full rounded"
              />
            ),
          },
          { type: "file", name: "README.md", render: <MeetAI /> },
          {
            type: "file",
            name: "github",
            src: "https://github.com/GauravAhuja7/Saas-meet-ai",
          },
          {
            type: "file",
            name: ".vscode",
            src: "https://github.dev/GauravAhuja7/Saas-meet-ai",
          },
          {
            type: "file",
            name: "live",
            src: "https://saas-meet-ai-two.vercel.app",
          },
        ],
      },
      {
        type: "folder",
        name: "gc-app",
        children: [
          { type: "file", name: "README.md", render: <GCApp /> },
          {
            type: "file",
            name: "github",
            src: "https://github.com/GauravAhuja7/General-Championship",
          },
          {
            type: "file",
            name: ".vscode",
            src: "https://github.dev/GauravAhuja7/General-Championship",
          },
        ],
      },
      {
        type: "folder",
        name: "credit-scoring",
        children: [
          { type: "file", name: "README.md", render: <CreditScoring /> },
          {
            type: "file",
            name: "github",
            src: "https://github.com/GauravAhuja7/Credit-Scoring-AiHack-India-2025",
          },
          {
            type: "file",
            name: ".vscode",
            src: "https://github.dev/GauravAhuja7/Credit-Scoring-AiHack-India-2025",
          },
        ],
      },
      {
        type: "file",
        name: "Reflection.md",
        render: <Reflection />,
      },
    ],
  },
  {
    type: "file",
    name: "AboutMe.md",
    render: <AboutMe />,
  },
  {
    type: "file",
    name: "Experience.md",
    render: <Experience />,
  },
  {
    type: "file",
    name: "Skills.md",
    render: <Skills />,
  },
  {
    type: "file",
    name: "Hobbies.md",
    render: <Hobbies />,
  },
];
