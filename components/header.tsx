'use client'
import Link from 'next/link'
import { LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import React, { useEffect } from 'react'
import { ModeToggle } from './modetoggle'
import { authClient } from '@/lib/auth-client'

import { redirect } from 'next/navigation'
import Image from 'next/image'



const menuItems = [
    { name: 'Features', href: '#link' },
    { name: 'Solution', href: '#link' },
    { name: 'Pricing', href: '#link' },
    { name: 'About', href: '#link' },
]

export const HeroHeader =() => {
    const [menuState, setMenuState] = React.useState(false)
    const  {data:session,isPending} =   authClient.useSession()
    const handleLogOut =async () =>{
       await  authClient.signOut()
       redirect('/')
       
    }


    
    
    
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="bg-background/50 sticky z-20 w-full border-b backdrop-blur-3xl">
                <div className="mx-auto   max-w-6xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                {/* <Logo /> */}
                                <Image src='/Stackup.png' width={60} height={60}alt='logo' />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>

                            <div className="hidden lg:block">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {isPending?"loading":
                            session ?
                               
                              <div className='flex items-center justify-center'>
                              <div className=' text-lg font-semibold mr-3 '>
                                Hello, {session.user.name}
                              </div>

                               <Button onClick={handleLogOut}>
                                SignOut<LogOut/>

                               </Button> 
                              </div>
                               
                               :
                                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm">
                                    <Link href="/login">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm">
                                    <Link href="/signup">
                                        <span>Sign Up</span>
                                    </Link>
                                </Button>
                            </div>
                            }
                            <ModeToggle/>
                            
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}
