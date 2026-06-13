"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12 sm:py-20">
      <div className="mb-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">
          Create account
        </h1>
        <p className="text-ink/55 text-sm mt-1">
          Start shortening links for free
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error && (
            <p className="text-sm font-semibold text-red bg-red/10 border-[2px] border-red rounded-[8px] px-3 py-2 flex items-center gap-2">
              <span>⚠</span> {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full py-3">
            Sign up →
          </Button>
        </form>
        <p className="text-sm text-ink/60 mt-5 text-center border-t-[2px] border-ink/10 pt-4">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-ink hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
