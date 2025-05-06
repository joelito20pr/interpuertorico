import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Iniciando configuración de la base de datos...');

  try {
    // Crear un usuario administrador
    const adminEmail = 'admin@interpr.com';
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminEmail,
      },
    });

    if (!existingUser) {
      // Crear un hash de la contraseña
      const hashedPassword = await hash('admin123', 10);
      
      // Crear el usuario administrador
      await prisma.user.create({
        data: {
          name: 'Administrador',
          email: adminEmail,
          password: hashedPassword,
        },
      });
      console.log('✅ Usuario administrador creado con éxito');
    } else {
      console.log('ℹ️ El usuario administrador ya existe');
    }

    // Crear un evento de ejemplo
    const eventTitle = 'Entrenamiento Especial - Técnicas de Futsal';
    
    // Verificar si el evento ya existe
    const existingEvent = await prisma.event.findFirst({
      where: {
        title: eventTitle,
      },
    });

    if (!existingEvent) {
      // Crear un evento de ejemplo
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 14); // Fecha 14 días en el futuro
      
      await prisma.event.create({
        data: {
          title: eventTitle,
          description: 'Sesión especial de entrenamiento enfocada en técnicas avanzadas de futsal para jugadores de 11 años. Traer ropa deportiva y agua.',
          date: futureDate,
          location: 'Centro Deportivo de Puerto Rico',
          requiresPayment: false,
        },
      });
      console.log('✅ Evento de ejemplo creado con éxito');
    } else {
      console.log('ℹ️ El evento de ejemplo ya existe');
    }

    console.log('✅ Configuración de la base de datos completada con éxito');
  } catch (error) {
    console.error('❌ Error durante la configuración de la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
