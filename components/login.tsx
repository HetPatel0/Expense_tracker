'use client'
import { signInAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import { redirect, useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
    const router = useRouter()
    const [email,setEmail] =useState("")
    const [pss,setPss] =useState("")
  const  handleSignIn= async(e:any)=>{
    e.preventDefault();
    const { data, error } = await authClient.signIn.email({
    email: email, // required
    password: pss, // required
    rememberMe: true,
},{
    onSuccess:(ctx)=>{
      router.push('/')
    }
}

)
}
 

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                action={signInAction}
              
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            {/* logog here */}
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to Tailark</h1>
                        <p className="text-sm">Welcome back! Sign in to continue</p>
                    </div>


                    <hr className="my-4 border-dashed" />

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                email
                            </Label>
                            <Input
                                type="email"
                                required
                                name="email"
                                id="email"
                                onChange={(e)=>setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-0.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="pwd"
                                    className="text-sm">
                                    Password
                                </Label>
                                <Button
                                    asChild
                                    variant="link"
                                    size="sm">
                                    <Link
                                        href="#"
                                        className="link intent-info variant-ghost text-sm">
                                        Forgot your Password ?
                                    </Link>
                                </Button>
                            </div>
                            <Input
                                type="password"
                                required
                                name="password"
                                id="password"
                                className="input sz-md variant-mixed"
                                onChange={(e)=>setPss(e.target.value)}
                            />
                        </div>

                        <Button className="w-full"  type='submit' onClick={handleSignIn} >Sign In</Button>
                    </div>
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Don't have an account ?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/signup">Create account</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )

}