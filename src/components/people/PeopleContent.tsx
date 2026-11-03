'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, Users, Truck, Filter, MoreHorizontal, FileText, ChevronRight, CheckCircle2, AlertTriangle, Clock, FileX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AddPersonForm } from './AddPersonForm'
import { AddVehicleForm } from './AddVehicleForm'
import { cn, getInitials, calculateComplianceScore } from '@/lib/utils'
import { DocumentStatus } from '@/types'

interface Props {
  people: Record<string, unknown>[]
  vehicles: Record<string, unknown>[]
  companyId: string
  role: string
}

function CompliancePill({ documents }: { documents: Record<string, unknown>[] }) {
  const total = documents.length
  if (total === 0) return <span className="text-xs text-gray-400">No docs</span>

  const expired = documents.filter(d => d.status === 'expired').length
  const expiring = documents.filter(d => d.status === 'expiring_soon').length
  const missing = documents.filter(d => d.status === 'missing').length
  const active = documents.filter(d => d.status === 'active').length

  if (expired > 0) return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-700">
      <AlertTriangle className="w-3 h-3" /> {expired} expired
    </span>
  )
  if (expiring > 0) return (
    <span className="flex items-center gap-1 text-xs font-medium text-yellow-700">
      <Clock className="w-3 h-3" /> {expiring} expiring
    </span>
  )
  if (missing > 0) return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-500">
      <FileX className="w-3 h-3" /> {missing} missing
    </span>
  )
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-green-700">
      <CheckCircle2 className="w-3 h-3" /> All current
    </span>
  )
}

export function PeopleContent({ people, vehicles, companyId, role }: Props) {
  const [search, setSearch] = useState('')
  const [showAddPerson, setShowAddPerson] = useState(false)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [activeTab, setActiveTab] = useState('people')
  const router = useRouter()

  const canEdit = ['owner', 'admin', 'staff'].includes(role)

  const filteredPeople = people.filter(p => {
    const name = `${p.first_name} ${p.last_name}`.toLowerCase()
    const company = ((p.company_name as string) || '').toLowerCase()
    return name.includes(search.toLowerCase()) || company.includes(search.toLowerCase())
  })

  const filteredVehicles = vehicles.filter(v => {
    const label = `${v.make} ${v.model} ${v.plate || ''}`.toLowerCase()
    return label.includes(search.toLowerCase())
  })

  const typeLabel: Record<string, string> = {
    employee: 'Employee',
    subcontractor: 'Subcontractor',
    vendor: 'Vendor',
  }

  const typeColor: Record<string, string> = {
    employee: 'bg-blue-50 text-blue-700 border-blue-100',
    subcontractor: 'bg-purple-50 text-purple-700 border-purple-100',
    vendor: 'bg-gray-50 text-gray-600 border-gray-200',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">People & Vehicles</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {people.length} people · {vehicles.length} vehicles
          </p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAddVehicle(true)} className="gap-2 hidden sm:flex">
              <Truck className="w-4 h-4" /> Add vehicle
            </Button>
            <Button size="sm" onClick={() => setShowAddPerson(true)} className="gap-2 bg-blue-700 hover:bg-blue-800">
              <Plus className="w-4 h-4" /> Add person
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search by name..."
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="people" className="gap-2">
            <Users className="w-4 h-4" />
            People <span className="text-xs text-gray-500">({filteredPeople.length})</span>
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-2">
            <Truck className="w-4 h-4" />
            Vehicles <span className="text-xs text-gray-500">({filteredVehicles.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          {filteredPeople.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">No people yet</p>
                <p className="text-sm text-gray-400 mb-4">Add employees, subcontractors, and vendors to track their documents.</p>
                {canEdit && (
                  <Button onClick={() => setShowAddPerson(true)} className="bg-blue-700 hover:bg-blue-800 gap-2">
                    <Plus className="w-4 h-4" /> Add first person
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredPeople.map(person => {
                const docs = (person.documents as Record<string, unknown>[]) ?? []
                return (
                  <Link key={person.id as string} href={`/people/${person.id}`}>
                    <Card className="hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-blue-700">
                            {getInitials(`${person.first_name} ${person.last_name}`)}
                          </span>
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {String(person.first_name)} {String(person.last_name)}
                            </span>
                            <Badge variant="outline" className={cn('text-xs', typeColor[String(person.type)] || '')}>
                              {typeLabel[String(person.type)] || String(person.type)}
                            </Badge>
                            {!person.is_active && (
                              <Badge variant="outline" className="text-xs text-gray-400">Inactive</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {!!person.job_title && (
                              <span className="text-xs text-gray-500">{String(person.job_title)}</span>
                            )}
                            {!!person.company_name && (
                              <span className="text-xs text-gray-400">{String(person.company_name)}</span>
                            )}
                          </div>
                        </div>
                        {/* Compliance */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                            <FileText className="w-3.5 h-3.5" />
                            {docs.length} doc{docs.length !== 1 ? 's' : ''}
                          </div>
                          <CompliancePill documents={docs} />
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="vehicles">
          {filteredVehicles.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-10 text-center">
                <Truck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-1">No vehicles yet</p>
                <p className="text-sm text-gray-400 mb-4">Add company vehicles to track registrations, insurance, and inspections.</p>
                {canEdit && (
                  <Button onClick={() => setShowAddVehicle(true)} className="bg-blue-700 hover:bg-blue-800 gap-2">
                    <Plus className="w-4 h-4" /> Add vehicle
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredVehicles.map(vehicle => {
                const docs = (vehicle.documents as Record<string, unknown>[]) ?? []
                return (
                  <Link key={vehicle.id as string} href={`/people/vehicle/${vehicle.id}`}>
                    <Card className="hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-900">
                            {vehicle.year ? String(vehicle.year) : ''} {String(vehicle.make)} {String(vehicle.model)}
                          </span>
                          {!!vehicle.plate && (
                            <span className="text-xs text-gray-400 ml-2">#{String(vehicle.plate)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <CompliancePill documents={docs} />
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add person dialog */}
      <Dialog open={showAddPerson} onOpenChange={setShowAddPerson}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add person</DialogTitle>
            <DialogDescription>Add an employee, subcontractor, or vendor to track their compliance documents.</DialogDescription>
          </DialogHeader>
          <AddPersonForm
            companyId={companyId}
            onSuccess={() => {
              setShowAddPerson(false)
              router.refresh()
            }}
            onCancel={() => setShowAddPerson(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Add vehicle dialog */}
      <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add vehicle</DialogTitle>
            <DialogDescription>Track registrations, insurance, and inspection certificates for company vehicles.</DialogDescription>
          </DialogHeader>
          <AddVehicleForm
            companyId={companyId}
            onSuccess={() => {
              setShowAddVehicle(false)
              router.refresh()
            }}
            onCancel={() => setShowAddVehicle(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
