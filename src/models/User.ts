import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Livro } from './Livro';
import bcrypt from 'bcryptjs';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  nome!: string;

  @Column({ type: 'varchar', length: 100, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  senha!: string;

  @OneToMany(() => Livro, (livro) => livro.user)
  livros!: Livro[];

  private originalPassword!: string;

  @AfterLoad()
  setOriginalPassword() {
    this.originalPassword = this.senha;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Se a senha foi modificada e não está hashada, gera o hash
    if (this.senha !== this.originalPassword) {
      if (!this.senha.startsWith('$2a$') && !this.senha.startsWith('$2b$') && !this.senha.startsWith('$2y$')) {
        this.senha = await bcrypt.hash(this.senha, 10);
      }
    }
  }
}
