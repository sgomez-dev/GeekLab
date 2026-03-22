<script>
  let {
    users = [],
    currentUserId = null,
    onEdit = () => {},
    onDelete = () => {},
    busyId = null,
  } = $props();

  function formatDate(value) {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return '—';
    }
  }

  function roleLabel(role) {
    return role === 'admin' ? 'Administrador' : 'Usuario';
  }

  function isCurrentRow(id) {
    return currentUserId != null && String(id) === String(currentUserId);
  }
</script>

<div class="table-wrap">
  <table class="table">
    <thead>
      <tr>
        <th>Usuario</th>
        <th>Email</th>
        <th>Rol</th>
        <th>Alta</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {#each users as u (u._id)}
        <tr class:row-self={isCurrentRow(u._id)}>
          <td>
            <span class="username">{u.username}</span>
            {#if isCurrentRow(u._id)}
              <span class="pill">Tú</span>
            {/if}
          </td>
          <td class="email">{u.email}</td>
          <td>
            <span class="role-badge" class:admin={u.role === 'admin'}>
              {roleLabel(u.role)}
            </span>
          </td>
          <td class="date">{formatDate(u.createdAt)}</td>
          <td class="td-actions">
            <button
              class="ghost"
              type="button"
              onclick={() => onEdit(u)}
              disabled={busyId != null}
            >
              Editar
            </button>
            <button
              class="danger"
              type="button"
              onclick={() => onDelete(u)}
              disabled={isCurrentRow(u._id) || busyId != null}
            >
              {String(busyId) === String(u._id) ? 'Eliminando...' : 'Eliminar'}
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .table-wrap {
    max-width: 1200px;
    margin: 0 auto;
    background: #fff;
    border-radius: 14px;
    border: 1px solid var(--border-color);
    overflow: auto;
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
  }

  th {
    text-align: left;
    padding: 14px 16px;
    background: rgba(66, 71, 193, 0.12);
    color: rgba(28, 28, 41, 0.85);
    font-weight: 1000;
  }

  td {
    padding: 14px 16px;
    border-top: 1px solid rgba(224, 224, 224, 0.9);
    vertical-align: middle;
  }

  .row-self {
    background: rgba(66, 71, 193, 0.04);
  }

  .username {
    font-weight: 800;
  }

  .pill {
    margin-left: 8px;
    font-size: 0.72rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(66, 71, 193, 0.14);
    color: var(--primary-color);
    vertical-align: middle;
  }

  .email {
    color: rgba(28, 28, 41, 0.8);
    word-break: break-word;
  }

  .date {
    color: rgba(28, 28, 41, 0.65);
    font-size: 0.92rem;
    white-space: nowrap;
  }

  .role-badge {
    display: inline-flex;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 900;
    background: rgba(28, 28, 41, 0.06);
    border: 1px solid rgba(28, 28, 41, 0.1);
  }

  .role-badge.admin {
    background: rgba(66, 71, 193, 0.12);
    border-color: rgba(66, 71, 193, 0.22);
    color: var(--primary-color);
  }

  .td-actions {
    white-space: nowrap;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .ghost {
    border: 1px solid rgba(66, 71, 193, 0.25);
    background: rgba(255, 255, 255, 0.9);
    color: var(--primary-color);
    padding: 9px 12px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }

  .ghost:hover:not(:disabled) {
    background: rgba(66, 71, 193, 0.08);
  }

  .ghost:disabled,
  .danger:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .danger {
    border: none;
    background: #ff6b6b;
    color: #fff;
    padding: 9px 12px;
    border-radius: 12px;
    font-weight: 900;
    cursor: pointer;
  }
</style>
