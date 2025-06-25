// src/controllers/UserController.ts
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        res.status(400).json({ mensagem: 'Preencha todos os campos.' });
        return;
      }

      const userExists = await this.userRepository.findOneBy({ email });
      if (userExists) {
        res.status(400).json({ mensagem: 'E-mail já cadastrado.' });
        return;
      }

      const hash = await bcrypt.hash(senha, 10);
      const user = this.userRepository.create({ nome, email, senha: hash });
      await this.userRepository.save(user);

      res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        res.status(400).json({ mensagem: 'Preencha todos os campos.' });
        return;
      }

      const user = await this.userRepository.findOneBy({ email });

      if (!user) {
        res.status(400).json({ mensagem: 'Usuário não encontrado.' });
        return;
      }

      const match = await bcrypt.compare(senha, user.senha);
      if (!match) {
        res.status(401).json({ mensagem: 'Senha incorreta.' });
        return;
      }

      // Retorna dados básicos do usuário, sem JWT
      res.status(200).json({
        mensagem: 'Login bem-sucedido!',
        userId: user.id,
        nome: user.nome,
        email: user.email,
      });
    } catch (error) {
      next(error);
    }
  }
}