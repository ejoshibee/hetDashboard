import React, { useState, Suspense } from 'react'
import { defer, Await, useLoaderData } from 'react-router-dom'

export const loader = () => {
  return defer({ success: true, data: "hello world" })
}

export default function Map() {
  const data = useLoaderData()
  return (
    <>
      <Suspense>
        <Await resolve={data.data}>
          {(data) => <h1>{data}</h1>}
        </Await>
      </Suspense>
    </>
  )
}
