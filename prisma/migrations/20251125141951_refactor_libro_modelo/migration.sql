-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Libro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numero" INTEGER,
    "fechaRegistro" DATETIME,
    "numeroRegistro" TEXT,
    "titulo" TEXT NOT NULL,
    "autor" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "disponible" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Prestamo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "libroId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nombrePrestatario" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "email" TEXT,
    "fechaPrestamo" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaDevolucion" DATETIME,
    "fechaLimite" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "observaciones" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prestamo_libroId_fkey" FOREIGN KEY ("libroId") REFERENCES "Libro" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Prestamo_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "detalles" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Prestamo_libroId_idx" ON "Prestamo"("libroId");

-- CreateIndex
CREATE INDEX "Prestamo_usuarioId_idx" ON "Prestamo"("usuarioId");

-- CreateIndex
CREATE INDEX "Prestamo_estado_idx" ON "Prestamo"("estado");

-- CreateIndex
CREATE INDEX "Prestamo_dni_idx" ON "Prestamo"("dni");

-- CreateIndex
CREATE INDEX "AuditLog_usuarioId_idx" ON "AuditLog"("usuarioId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
