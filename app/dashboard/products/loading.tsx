import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Hero Header Skeleton */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 p-6 md:p-8 bg-gradient-to-br from-orange-500/5 via-background to-amber-500/5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-[52px] w-[52px] rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-28 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
        </div>
        
        {/* Search Bar Skeleton */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          <Skeleton className="h-11 flex-1 max-w-md rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-11 w-[160px] rounded-md" />
            <Skeleton className="h-11 w-[140px] rounded-md" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Products List Skeleton */}
        <div className="lg:col-span-2 space-y-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex gap-4">
                  {/* Score Circle */}
                  <Skeleton className="h-16 w-16 rounded-xl flex-shrink-0" />
                  
                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                          <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                        <Skeleton className="h-5 w-3/4" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-4">
          {/* Details Card */}
          <Card>
            <div className="h-2 bg-gradient-to-r from-orange-500/30 to-amber-500/30" />
            <CardContent className="p-5 space-y-5">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
              
              {/* Details */}
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-border/30">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
              
              {/* Benefits */}
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
              
              {/* CTA */}
              <Skeleton className="h-11 w-full rounded-md" />
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardContent className="p-5">
              <Skeleton className="h-5 w-36 mb-4" />
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-border/50">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
