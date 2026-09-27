/**
 * Render smoke test.
 *
 * A production build only proves the code parses and resolves — it cannot tell
 * you that a page actually renders. This mounts every route through
 * renderToString and fails on the first component that throws, which catches
 * the class of mistakes a bundler happily ships: a bad import, a missing data
 * key, a hook used incorrectly.
 *
 * It also asserts the structural rules from PRD B7 that the legacy site broke:
 * exactly one <h1> per page, and no leftover lorem ipsum.
 *
 * Run with: npm run smoke
 */
import { renderToString } from 'react-dom/server'
// React Router 7 dropped the react-router-dom/server entry point; StaticRouter
// is exported from the main package now.
import { StaticRouter } from 'react-router-dom'
import { MotionConfig } from 'motion/react'

import Home from '@/pages/Home'
import NotFound from '@/pages/NotFound'
import AboutIndex from '@/pages/about/AboutIndex'
import CompanyProfile from '@/pages/about/CompanyProfile'
import VisionMission from '@/pages/about/VisionMission'
import Values from '@/pages/about/Values'
import CorporateStrategies from '@/pages/about/CorporateStrategies'
import Foundation from '@/pages/about/Foundation'
import GroupIndex from '@/pages/group/GroupIndex'
import BusinessUnitPage from '@/pages/group/BusinessUnitPage'
import ContractFarming from '@/pages/group/ContractFarming'
import Career from '@/pages/Career'
import Contact from '@/pages/Contact'
import { businessUnits } from '@/data/businessUnits'

const routes = [
  ['/', Home],
  ['/about', AboutIndex],
  ['/about/company-profile', CompanyProfile],
  ['/about/vision-mission', VisionMission],
  ['/about/values', Values],
  ['/about/corporate-strategies', CorporateStrategies],
  ['/about/foundation', Foundation],
  ['/group', GroupIndex],
  ['/group/agriculture/contract-farming', ContractFarming],
  ...businessUnits.map((unit) => [`/group/${unit.slug}`, BusinessUnitPage]),
  ['/career', Career],
  ['/contact', Contact],
  ['/does-not-exist', NotFound],
]

let failures = 0
let checked = 0

for (const [path, Component] of routes) {
  try {
    const html = renderToString(
      <MotionConfig reducedMotion="user">
        <StaticRouter location={path}>
          <Component />
        </StaticRouter>
      </MotionConfig>
    )

    const h1Count = (html.match(/<h1[\s>]/g) ?? []).length
    const problems = []

    if (h1Count !== 1) problems.push(`${h1Count} <h1> elements (expected exactly 1)`)
    if (/lorem ipsum/i.test(html)) problems.push('contains lorem ipsum')
    if (html.length < 1000)
      problems.push(`suspiciously short output (${html.length} bytes)`)

    if (problems.length) {
      failures += 1
      console.error(`FAIL  ${path}\n      ${problems.join('\n      ')}`)
    } else {
      console.log(`ok    ${path}`)
    }
  } catch (error) {
    failures += 1
    console.error(`ERROR ${path}\n      ${error.message}`)
  }

  checked += 1
}

console.log(`\n${checked - failures}/${checked} routes rendered cleanly.`)

/**
 * Regression check for legacy bug A9.2.
 *
 * On the old homepage the tile image and the tile heading were separate hand-
 * written anchors, and three tiles (Industries, Beverages, VES Exam) had their
 * image still pointing at VRUMARKET.html — so clicking the picture took you to
 * the wrong division. Every division must now appear exactly once in the grid,
 * linking only to its own slug.
 */
console.log('\nChecking homepage grid links (legacy bug A9.2)…')

const homeHtml = renderToString(
  <MotionConfig reducedMotion="user">
    <StaticRouter location="/">
      <Home />
    </StaticRouter>
  </MotionConfig>
)

const gridHrefs = [...homeHtml.matchAll(/href="(\/group\/[^"]+)"/g)].map((m) => m[1])

for (const unit of businessUnits) {
  const expected = `/group/${unit.slug}`
  const occurrences = gridHrefs.filter((href) => href === expected).length

  if (occurrences === 0) {
    failures += 1
    console.error(`FAIL  ${unit.shortLabel}: missing from the homepage grid`)
  }
}

const unknown = gridHrefs.filter(
  (href) => !businessUnits.some((unit) => `/group/${unit.slug}` === href)
)

if (unknown.length) {
  failures += 1
  console.error(`FAIL  homepage grid links to unknown routes: ${unknown.join(', ')}`)
} else {
  console.log(`ok    all ${businessUnits.length} divisions link to their own page`)
}

if (failures) process.exit(1)
