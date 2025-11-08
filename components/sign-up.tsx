'use client'
import {  signUpAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
    const router = useRouter()
        const [email,setEmail] =useState("")
        const [name,setName] =useState("")
        const [pss,setPss] =useState("")
      const  handleSignUp= async(e:any)=>{
        e.preventDefault();
        const { data, error } = await authClient.signUp.email({
        email: email, // required
        password: pss, // required
        name:name
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
                action={signUpAction}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                           {/* logo */}
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Create a somethin app Account</h1>
                        <p className="text-sm">Welcome! Create an account to get started</p>
                    </div>

                  

                    <hr className="my-4 border-dashed" />

                    <div className="">
                        <div className=" ">
                            <div className="">
                                <Label
                                    htmlFor="name"
                                    className="block text-sm">
                                    name
                                </Label>
                                <Input
                                    type="text"
                                    required
                                    name="name"
                                    id="name"
                                    onChange={(e)=>setName(e.currentTarget.value)}
                                    />
                            </div>
                          
                        </div>

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
                                onChange={(e)=>setEmail(e.currentTarget.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-sm">
                                Password
                            </Label>
                            <Input
                                type="password"
                                required
                                name="password"
                                id="password"
                                className="input sz-md variant-mixed"
                            onChange={(e)=>setPss(e.currentTarget.value)}
                            />
                        </div>

                        <Button className="w-full mt-4" type='submit'  onClick={handleSignUp}>Continue</Button>
                    </div>
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Have an account ?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}
