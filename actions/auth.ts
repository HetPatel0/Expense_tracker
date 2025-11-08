'use server'
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-client";
import { body } from "motion/react-client";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function signUpAction(formData:FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;
   

    await auth.api.signUpEmail({
        body:{
            email,
            password,
            name
            
        },
        headers: await headers()
    })
     await authClient.getSession()
     
     redirect('/');
     
    }
    export async function signInAction(formData:FormData) {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        await authClient.signIn.email({
            email:email,
            password:password,
            rememberMe:true
        })
        
        
        await auth.api.signInEmail({
            body:{
                email,
                password
            },
            
            headers: await headers()
        })
        redirect('/');
        
    }
    export async function signOutAction() {
        
        await authClient.signOut()
        await auth.api.signOut({
            headers: await headers()
        })
        redirect('/');
        
}