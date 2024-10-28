import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
      <div className="flex items-center justify-center">
        <div className="text-center space-y-6 pt-24">
          <h1 className="font-bold text-3xl text-[#2e2a47]">Sign in</h1>
          <SignIn />
        </div>
      </div>
  )
}