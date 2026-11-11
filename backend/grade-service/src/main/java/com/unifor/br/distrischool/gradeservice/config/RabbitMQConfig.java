package com.unifor.br.distrischool.gradeservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${distrischool.rabbitmq.exchange:distrischool.events}")
    private String exchangeName;

    @Value("${distrischool.rabbitmq.grade-queue:grade.queue}")
    private String queueName;

    @Value("${distrischool.rabbitmq.grade-routing-key:grade.posted}")
    private String routingKey;

    @Bean
    public TopicExchange eventsExchange() {
        return new TopicExchange(exchangeName, true, false);
    }

    @Bean
    public Queue gradeQueue() {
        return QueueBuilder.durable(queueName).build();
    }

    @Bean
    public Binding gradeBinding(Queue gradeQueue, TopicExchange eventsExchange) {
        return BindingBuilder.bind(gradeQueue).to(eventsExchange).with(routingKey);
    }

    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public AmqpTemplate amqpTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
