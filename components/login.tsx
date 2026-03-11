'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { type FormEvent, useState } from 'react'

export default function LoginPage() {
    const router = useRouter()
    const [email,setEmail] =useState("")
    const [pss,setPss] =useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

  const  handleSignIn= async(e: FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    setErrorMessage("")
    setIsSubmitting(true)
    try {
      const { error } = await authClient.signIn.email({
        email,
        password: pss,
        rememberMe: true,
      })

      if (error) {
        setErrorMessage(error.message || "Unable to sign in. Please try again.")
        setIsSubmitting(false)
        return
      }

      router.push('/')
      router.refresh()
    } catch {
      setErrorMessage("Unable to sign in. Please try again.")
      setIsSubmitting(false)
    }
  }
 

    return (
        <section className="flex min-h-screen bg-muted/40 px-4 py-16 md:py-32">
            <form
                onSubmit={handleSignIn}
              
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border border-border p-0.5 shadow-md">
                <div className="p-8 pb-6">
                    <div>
                        <Link
                            href="/"
                            aria-label="go home">
                            {/* logog here */}
                        </Link>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Sign In to StackUP</h1>
                        <p className="text-sm text-muted-foreground">Welcome back! Sign in to continue</p>
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

                        {errorMessage ? (
                          <p className="text-sm text-destructive">{errorMessage}</p>
                        ) : null}

                        <Button className="w-full"  type='submit' disabled={isSubmitting} >  {
                                isSubmitting ? <Loader2 className='animate-spin' /> : "SignIn"
                            }</Button>
                    </div>
                </div>

                <div className="bg-muted rounded-lg border border-border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Don&apos;t have an account ?
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
