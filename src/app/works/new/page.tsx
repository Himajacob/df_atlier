import BackButton from "@/components/BackButton";
import WorkForm from "@/components/WorkForm";

export default function NewWorkPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <BackButton />
      <h1 className="mb-6 font-display text-3xl font-semibold text-forest">
        New Work Order
      </h1>
      <WorkForm />
    </div>
  );
}
