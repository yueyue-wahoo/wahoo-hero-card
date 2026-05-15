import { countCapturedEmails } from "@/lib/email-csv";
import ArchiveEventButton from "@/components/ArchiveEventButton";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const count = await countCapturedEmails();

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-white">Email list</h1>

        <div className="bg-[#141414] border-2 border-[#2A2A2A] rounded-xl p-6 flex flex-col gap-4">
          <div>
            <div className="text-sm uppercase tracking-wide text-gray-500">
              Total captured
            </div>
            <div className="text-4xl font-bold text-white mt-1">{count}</div>
          </div>

          <a
            href="/api/email-capture/export"
            className="text-center px-8 py-4 text-white bg-blue-600 rounded-xl text-lg font-bold hover:bg-blue-700 transition-colors"
          >
            Download CSV
          </a>
        </div>

        <ArchiveEventButton disabled={count === 0} />
      </div>
    </main>
  );
}
