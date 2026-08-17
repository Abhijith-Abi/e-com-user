import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEnquiry } from "@/hooks/useEnquiry";

interface FormErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}

const Contact = () => {
    const [form, setForm] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        subject: false,
        message: false,
    });
    const { submitEnquiry, isLoading, error } = useEnquiry();

    const contactInfo = [
        {
            icon: Mail,
            label: "Email",
            value: "info@sebastianstores.com",
            href: "mailto:info@sebastianstores.com",
        },
        {
            icon: Phone,
            label: "Phone",
            value: "7736545684",
            href: "tel:+917736545684",
        },
        {
            icon: MapPin,
            label: "Address",
            value: "sebastianstores 100 T2, Sebastian Stores Park, Wayanad 673122, KL, India",
        },
        { icon: Clock, label: "Hours", value: "Mon - Fri: 9:00 AM - 6:00 PM" },
    ];

    const validateField = (name: string, value: string): string | undefined => {
        switch (name) {
            case "name":
                if (!value.trim()) return "Name is required";
                if (value.trim().length < 2)
                    return "Name must be at least 2 characters";
                if (!/^[A-Za-z\s]+$/.test(value))
                    return "Name must contain only letters and spaces";
                return undefined;
            case "email":
                if (!value.trim()) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    return "Please enter a valid email";
                return undefined;
            case "subject":
                if (!value.trim()) return "Subject is required";
                if (value.trim().length < 3)
                    return "Subject must be at least 3 characters";
                return undefined;
            case "message":
                if (!value.trim()) return "Message is required";
                if (value.trim().length < 10)
                    return "Message must be at least 10 characters";
                return undefined;
            default:
                return undefined;
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        if (touched[name as keyof typeof touched]) {
            const error = validateField(name, value);
            setErrors({ ...errors, [name]: error });
        }
    };

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        const error = validateField(name, value);
        setErrors({ ...errors, [name]: error });
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        newErrors.name = validateField("name", form.name);
        newErrors.email = validateField("email", form.email);
        newErrors.subject = validateField("subject", form.subject);
        newErrors.message = validateField("message", form.message);

        setErrors(newErrors);
        return !Object.values(newErrors).some((err) => err);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        submitEnquiry(
            {
                name: form.name,
                email: form.email,
                subject: form.subject,
                message: form.message,
            },
            {
                onSuccess: () => {
                    toast.success("Your message has been sent successfully!");
                    setForm({ name: "", email: "", subject: "", message: "" });
                    setErrors({});
                    setTouched({
                        name: false,
                        email: false,
                        subject: false,
                        message: false,
                    });
                },
                onError: () => {
                    toast.error(
                        error || "Failed to send message. Please try again.",
                    );
                },
            },
        );
    };

    return (
        <main className="min-h-screen">
            <section className="bg-primary text-primary-foreground py-16 md:py-24">
                <div className="container text-center max-w-2xl mx-auto">
                    <p className="text-xs tracking-[0.3em] uppercase mb-3 text-accent">
                        Get in Touch
                    </p>
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                        Contact Us
                    </h1>
                    <p className="text-sm opacity-90">
                        Have questions? We'd love to hear from you. Send us a
                        message and we'll respond as soon as possible.
                    </p>
                </div>
            </section>

            <section className="container py-16 md:py-24">
                <div className="grid md:grid-cols-5 gap-12 max-w-5xl mx-auto">
                    {/* Info */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h2 className="font-display text-lg font-bold mb-6">
                                Contact Information
                            </h2>
                            <div className="space-y-5">
                                {contactInfo.map((c) => (
                                    <div
                                        key={c.label}
                                        className="flex items-start gap-3"
                                    >
                                        <c.icon className="w-4 h-4 mt-0.5 text-accent" />
                                        <div>
                                            <p className="text-xs text-muted-foreground tracking-widest uppercase">
                                                {c.label}
                                            </p>
                                            {c.href ? (
                                                <a
                                                    href={c.href}
                                                    className="text-sm font-medium hover:text-accent transition-colors"
                                                >
                                                    {c.value}
                                                </a>
                                            ) : (
                                                <p className="text-sm font-medium">
                                                    {c.value}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="md:col-span-3 space-y-5"
                    >
                        <h2 className="font-display text-lg font-bold mb-2">
                            Send a Message
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    placeholder="Your Name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`bg-background ${errors.name && touched.name ? "border-destructive" : ""}`}
                                />
                                {errors.name && touched.name && (
                                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Input
                                    type="email"
                                    placeholder="Your Email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`bg-background ${errors.email && touched.email ? "border-destructive" : ""}`}
                                />
                                {errors.email && touched.email && (
                                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div>
                            <Input
                                placeholder="Subject"
                                name="subject"
                                value={form.subject}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`bg-background ${errors.subject && touched.subject ? "border-destructive" : ""}`}
                            />
                            {errors.subject && touched.subject && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.subject}
                                </p>
                            )}
                        </div>
                        <div>
                            <Textarea
                                placeholder="How can we help you?"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                rows={5}
                                className={`bg-background resize-none ${errors.message && touched.message ? "border-destructive" : ""}`}
                            />
                            {errors.message && touched.message && (
                                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.message}
                                </p>
                            )}
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="gap-2"
                        >
                            <Send className="w-4 h-4" />{" "}
                            {isLoading ? "Sending..." : "Send Message"}
                        </Button>
                    </form>
                </div>
            </section>
        </main>
    );
};

export default Contact;
