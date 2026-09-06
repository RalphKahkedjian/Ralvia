import { getAiActions } from "@/lib/api/aiAction";
import AiActionCard from "@/components/actions/AiActionCard";

export default async function ActionsPage() {
  const actions = await getAiActions();

  return (
    <div className="bg-[#FBFAF8]">
      <div>
        <h1 className="font-serif text-3xl text-[#14213D]"> Action Center</h1>
        <p className="mt-2 text-[#5B6472]">
          Review work suggested by your finance agent.
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {actions.map((action) => (
          <AiActionCard key={action.id} initialAction={action} />
        ))}

        {actions.length === 0 && (
          <div className="rounded-md border border-[#D8DCE3] bg-white p-6 text-[#5B6472]">
            No AI actions yet.
          </div>
        )}
      </div>
    </div>
  );
}