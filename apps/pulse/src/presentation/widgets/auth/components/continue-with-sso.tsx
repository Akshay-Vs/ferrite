"use client"

import GoogleSSO from "./google-sso"
import FacebookSSO from "./facebook-sso"
import MicrosoftSSO from "./microsoft-sso"
import { Loading } from '@clerk/elements/common'
import { Root } from '@clerk/elements/sign-in'
import { Skeleton } from "@/presentation/primitives/skeleton"

const SSOSkeleton = () => (
  <div className="col-center gap-6 text-center">
    <p>Or continue with</p>
    <div className="flex gap-12 center full">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="size-14 rounded-full" />
      ))}
    </div>
  </div>
)

const ContinueWithSSO = () => {
  return (
    <Root fallback={<SSOSkeleton />}>
      <Loading>
        {(isGlobalLoading) => (
          <div className="col-center gap-6 text-center">
            <p>Or continue with</p>
            <div className="flex gap-12 center full">
              <GoogleSSO isGlobalLoading={isGlobalLoading} />
              <FacebookSSO isGlobalLoading={isGlobalLoading} />
              <MicrosoftSSO isGlobalLoading={isGlobalLoading} />
            </div>
          </div>
        )}
      </Loading>
    </Root>
  )
}

export default ContinueWithSSO
