import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      weight: Yup.number().required(),
      height: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    // Verifica se email já está cadastrado
    const emailExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (emailExists)
      return res.status(400).json({ error: 'Email já cadastrado' });

    // Cadastra estudante
    const { id, name, email, age, weight, height } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }

  async index(req, res) {
    const schema = Yup.object().shape({
      q: Yup.string(),
    });

    if (!(await schema.isValid(req.query)))
      return res.status(400).json({ error: 'Erro de validação' });

    const { page = 1, q } = req.query;

    if (!q) {
      const users = await Student.findAll({
        order: ['name'],
        limit: 20,
        offset: (page - 1) * 20,
      });

      return res.json(users);
    }
    const user = await Student.findAll({
      where: { name: { [Op.iLike]: `%${q}%` } },
      limit: 20,
      offset: (page - 1) * 20,
    });

    if (user === null)
      return res.status(400).json({ error: 'Aluno não encontrado' });

    return res.json(user);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number(),
      weight: Yup.number(),
      height: Yup.number(),
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Erro de validação' });

    const student = await Student.findByPk(req.params.studentId);

    if (!student)
      return res.status(401).json({ error: 'Estudante não encontrado' });

    // Se email estiver sendo alterado
    if (req.body.email !== student.email) {
      // Verifica se o novo email já está cadastrado
      const emailExists = await Student.findOne({
        where: { email: req.body.email },
      });

      if (emailExists)
        return res.status(401).json({ error: 'Email já cadastrado' });
    }

    const { id, name, email, age, weight, height } = await student.update(
      req.body
    );

    return res.json({ id, name, email, age, weight, height });
  }
}

export default new StudentController();
