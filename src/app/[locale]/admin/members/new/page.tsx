import { MemberForm } from '@/components/admin/member-form'

export default function NewMemberPage() {
  return (
    <div className="max-w-2xl">
      <MemberForm
        mode="create"
        defaultLimits={{ daily: 5, monthly: 60 }}
      />
    </div>
  )
}
