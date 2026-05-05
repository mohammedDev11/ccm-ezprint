import { ProgressSteps } from "@/components/shared/features/ProgressSteps";
import SectionHeader from "../../components/SectionHeader";
import ConversationThread from "../../components/ConversationThread.tsx";
import favicon from "@/app/favicon.ico";

const HowItWorks = () => {
  const data: {
    title: string;
    content: React.ReactNode;
  }[] = [
    {
      title: "Upload",
      content: (
        <ConversationThread
          adminIcon={favicon}
          messages={[
            {
              id: "1",
              sender: "user",
              text: "I want to print this file from the web dashboard.",
            },
            {
              id: "2",
              sender: "admin",
              text: "Sure — upload your document and choose the printer queue before submitting.",
            },
            {
              id: "3",
              sender: "user",
              text: "Can I know the expected pages and cost first?",
            },
            {
              id: "4",
              sender: "admin",
              text: "Yes, the system can show the estimated page count and printing cost before confirmation.",
            },
          ]}
        />
      ),
    },
    {
      title: "Secure Queue",
      content: (
        <ConversationThread
          adminIcon={favicon}
          messages={[
            {
              id: "1",
              sender: "user",
              text: "What happens after I submit the file?",
            },
            {
              id: "2",
              sender: "admin",
              text: "Your print job is placed in a secure release queue and stays there until you release it.",
            },
            {
              id: "3",
              sender: "user",
              text: "Can anyone else open it?",
            },
            {
              id: "4",
              sender: "admin",
              text: "No — only the original uploader can see the job before printing, and unprinted files are deleted after the retention period.",
            },
          ]}
        />
      ),
    },
    {
      title: "Authenticate",
      content: (
        <ConversationThread
          adminIcon={favicon}
          messages={[
            {
              id: "1",
              sender: "user",
              text: "How do I actually print it at the printer?",
            },
            {
              id: "2",
              sender: "admin",
              text: "Authenticate at the printer first. Then your pending jobs will appear for release.",
            },
            {
              id: "3",
              sender: "user",
              text: "What if my balance is not enough?",
            },
            {
              id: "4",
              sender: "admin",
              text: "The system checks your balance or quota before printing and blocks the release if it is insufficient.",
            },
          ]}
        />
      ),
    },
    {
      title: "Print & Track",
      content: (
        <ConversationThread
          adminIcon={favicon}
          messages={[
            {
              id: "1",
              sender: "user",
              text: "What happens after the document is printed?",
            },
            {
              id: "2",
              sender: "admin",
              text: "The job is removed from pending release automatically after successful printing.",
            },
            {
              id: "3",
              sender: "user",
              text: "Does the system keep a record?",
            },
            {
              id: "4",
              sender: "admin",
              text: "Yes — it logs the printer, time, pages, and print attributes, while the uploaded file is deleted right after printing.",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div id="how-it-works" className="section relative w-full overflow-hidden">
      <SectionHeader
        title="How EzPrint Works"
        description="A simple conversation-based flow that shows how users upload, secure, release, and track their print jobs."
        align="center"
      />

      <div>
        <ProgressSteps data={data} />
      </div>
    </div>
  );
};

export default HowItWorks;
