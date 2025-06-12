import { signIn } from "@/components/others/firebase/api/auth";
import { Button } from "@/components/ui/button";
import FullScreenLoader from "@/components/ui/custom/loader/FullScreen";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
});

const Login = () => {
    const [loading, setLoading] = useState<null | string>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        defaultValues: {
            email: "",
            password: "",
        },
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setLoading("Logging in");
        try {
            await signIn(data.email, data.password);
            toast.success("Logged in successfully");
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Failed to log in. Please check your credentials.");
        } finally {
            setLoading(null);
            form.reset();
        }
    };

    return (
        <div className="w-full mt-30 flex items-center justify-center">
            {loading && <FullScreenLoader text={loading} />}
            <div className="max-w-sm w-full flex flex-col items-center border rounded-lg p-6 shadow-sm">
                {/* <Logo className="h-9 w-9" /> */}
                <p className="mt-4 text-xl font-bold tracking-tight">
                    Log in to Smart Doser
                </p>

                <Form {...form}>
                    <form
                        className="w-full space-y-4"
                        onSubmit={form.handleSubmit(onSubmit)}
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Email"
                                            className="w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            className="w-full"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="mt-4 w-full">
                            Continue with Email
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
};
export default Login;
