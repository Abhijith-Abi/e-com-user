import { type CustomerProfile } from "@/services/customer.service";

interface Props {
    profile: CustomerProfile | null;
    loading: boolean;
    user: { full_name?: string; email?: string };
}

const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="bg-zinc-50/40 dark:bg-zinc-900/50 border border-zinc-100/50 dark:border-zinc-850 p-4 rounded-xl transition-all duration-300 hover:border-zinc-200 dark:hover:border-zinc-800">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans font-bold tracking-widest uppercase mb-1.5">
            {label}
        </p>
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-sans">
            {value || "—"}
        </p>
    </div>
);

const ProfileTab = ({ profile, loading, user }: Props) => {
    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 p-6 md:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.015)]">
            <h2 className="font-display text-base font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
                Profile Information
            </h2>
            {loading ? (
                <div className="flex items-center gap-2 py-4">
                    <svg
                        className="animate-spin h-4 w-4 text-zinc-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <p className="text-zinc-400 font-sans text-xs tracking-wider uppercase font-semibold">
                        Loading profile information...
                    </p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-5 max-w-2xl">
                    <Field
                        label="Full Name"
                        value={profile?.user_full_name || user.full_name}
                    />
                    <Field
                        label="Email Address"
                        value={profile?.user_email || user.email}
                    />
                    <Field label="Phone Number" value={profile?.user_phone} />
                    <Field label="Country" value={profile?.country} />
                </div>
            )}
        </div>
    );
};

export default ProfileTab;
